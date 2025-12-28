import { headers } from 'next/headers';
import { lookupIP, MAXMIND_SUPPORTED_LOCALES } from './geoip';

export type MoodcastLocation = {
    region0: string; // Country (Display)
    region1: string; // City/State (Display)
    region2: string; // District/Borough (Display)
    timezone: string;
    std: {
        region0: string; // Country (English)
        region1: string; // City/State (English)
        region2: string; // District/Borough (English)
    }
};

/**
 * Detects location and timezone.
 * Priority: MaxMind GeoIP (Local DB) -> Vercel Headers -> Unknown
 * 
 * @param locale Target locale for localization (e.g. 'ko')
 * @param options Configuration options
 * @param options.skipLocalization If true, skips blocking API calls for localization (Nominatim). faster but less accurate names.
 */
export async function detectLocationFromHeaders(
    locale: string = 'ko',
    options: { skipLocalization?: boolean } = { skipLocalization: true }
): Promise<MoodcastLocation> {
    const headerStore = await headers();

    // 1. Get Client IP
    let ip = headerStore.get('x-forwarded-for') || '127.0.0.1';
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    let city = 'Unknown';
    let country = 'Unknown';
    let region2 = 'Unknown';
    let timezone = 'Asia/Seoul';

    // Standard Names (Default to Unknown)
    let cityEn = 'Unknown';
    let countryEn = 'Unknown';
    let region2En = 'Unknown';

    // 2. Try MaxMind GeoIP
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const geoResult = await lookupIP(ip, locale);
        if (geoResult) {
            // Special Handling (e.g. Korea):
            // MaxMind returns District/Si/Gun as 'city' and Do/SpecialCity as 'subdivision'.
            // We want Region1=Do/SpecialCity, Region2=District/Si.
            // Result: Region1="Seoul", Region2="Seodaemun-gu"
            if (geoResult.countryCode === 'KR' && geoResult.subdivision) {
                // Display Names
                city = geoResult.subdivision;
                region2 = geoResult.city;

                // Standard Names
                cityEn = geoResult.std.subdivision || geoResult.std.city; // Fallback to city if subd missing
                region2En = geoResult.std.city;
            } else {
                city = geoResult.city;
                region2 = 'Unknown'; // Default for non-KR

                cityEn = geoResult.std.city;
                region2En = 'Unknown';
            }

            // Immediate Country Localization:
            const code = geoResult.countryCode;
            if (code && code !== 'Unknown') {
                try {
                    const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
                    country = regionNames.of(code) || geoResult.country;
                } catch (e) {
                    country = geoResult.country;
                }
            } else {
                country = geoResult.country;
            }
            // Standard Country
            countryEn = geoResult.std.country;

            timezone = geoResult.timezone;

            // Localization Fallback (Nominatim)
            // DISABLED by default for performance on initial load.
            // ENABLED explicitly when called with skipLocalization: false (e.g. Voting Action)
            if (!options.skipLocalization && !MAXMIND_SUPPORTED_LOCALES.includes(locale) && city !== 'Unknown') {
                // We only fetch localized here on fallback, standard should be fine from MaxMind usually.
                // But MaxMind 'std' is already populated.
                const localized = await localizeLocationViaNominatim(city, country, locale);
                if (localized) {
                    if (localized.region1 && localized.region1 !== 'Unknown') city = localized.region1;
                    if (localized.region2 && localized.region2 !== 'Unknown') region2 = localized.region2;
                }
            }
        }
    }

    // 3. Fallback to Vercel Headers if MaxMind missed
    if (city === 'Unknown') {
        const vCity = headerStore.get('x-vercel-ip-city') || headerStore.get('cf-ipcity');
        const vCountry = headerStore.get('x-vercel-ip-country') || headerStore.get('cf-ipcountry');
        const vTz = headerStore.get('x-vercel-ip-timezone') || headerStore.get('cf-timezone');

        if (vCity) {
            city = vCity;
            cityEn = vCity; // Vercel headers are usually ASCII/English
        }
        if (vCountry) {
            country = vCountry;
            countryEn = vCountry;
        }
        if (vTz) timezone = vTz;

        // Apply fallback localization (Nominatim) ONLY if enabled
        if (!options.skipLocalization && city !== 'Unknown' && locale !== 'en') {
            const localized = await localizeLocationViaNominatim(city, country, locale);
            if (localized) {
                if (localized.region1 && localized.region1 !== 'Unknown') city = localized.region1;
                if (localized.region2 && localized.region2 !== 'Unknown') region2 = localized.region2;
            }
        }

        // Also localize Country code if it came from Vercel
        if (country.length === 2) {
            try {
                const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
                country = regionNames.of(country) || country;
                // Standard Country is likely the code or name from Vercel, keep as is (Code is fine for standard? No, User wanted name)
                // If it's code, let's try to get English name? 
                const regionNamesEn = new Intl.DisplayNames(['en'], { type: 'region' });
                countryEn = regionNamesEn.of(countryEn) || countryEn;
            } catch (e) { }
        }
    }

    return {
        region0: country,
        region1: city !== 'Unknown' ? city : country,
        region2: region2 !== 'Unknown' ? region2 : clickToRegion2(city),
        timezone,
        std: {
            region0: countryEn,
            region1: cityEn !== 'Unknown' ? cityEn : countryEn,
            region2: region2En !== 'Unknown' ? region2En : clickToRegion2(cityEn)
        }
    };
}

// Helper: In header-only mode, we often lack specific Lv2 data (District).
// We treat City as 'region1' primarily.
// If the user is in a big city (Seoul), header might say city='Seoul'.
function clickToRegion2(city: string): string {
    if (city === 'Unknown') return 'Unknown';
    // For now, headers don't give us Neighborhood/District reliably.
    // So region2 remains Unknown usually, or we duplicate city if granularity is low.
    return 'Unknown';
}

/**
 * Maps Nominatim address structure to Moodcast region levels.
 * Rules:
 * Lv0 (Country) = country
 * Lv1 (City)    = city (primary) > town > village > province > state
 * Lv2 (Borough) = borough (primary) > district > suburb > neighbourhood
 */
function mapNominatimAddress(addr: any): Partial<MoodcastLocation> {
    return {
        region0: addr.country || 'Unknown',
        // Prioritize City-like entities
        region1: addr.city || addr.town || addr.village || addr.province || addr.state || 'Unknown',
        // Prioritize Sub-city entities (Gu, District)
        region2: addr.borough || addr.district || addr.suburb || addr.neighbourhood || 'Unknown'
    };
}

/**
 * Helper to localize location using Nominatim Search.
 * Returns structured location data.
 */
export async function localizeLocationViaNominatim(queryCity: string, queryCountry: string, locale: string): Promise<Partial<MoodcastLocation> | null> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200); // Slight boost to timeout

        const query = `${queryCity}, ${queryCountry}`;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&accept-language=${locale}&limit=1`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Moodcast/1.0' },
            next: { revalidate: 3600 },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                return mapNominatimAddress(data[0].address);
            }
        }
    } catch (e) {
        return null;
    }
    return null;
}

/**
 * Detects location and timezone from GPS coordinates (High Precision).
 * Uses `geo-tz` for timezone and OpenStreetMap (Nominatim) for address.
 */
export async function detectLocationFromGPS(lat: number, lng: number, locale: string = 'ko'): Promise<Partial<MoodcastLocation>> {
    let timezone: string | undefined;

    // Default result
    let result: Partial<MoodcastLocation> = {
        region0: 'Unknown',
        region1: 'Unknown',
        region2: 'Unknown',
    };

    let std: { region0: string; region1: string; region2: string } = {
        region0: 'Unknown',
        region1: 'Unknown',
        region2: 'Unknown'
    };

    try {
        // 1. Identify Timezone from Coordinates (Accurate)
        const { find } = await import('geo-tz');
        const tzResult = find(lat, lng);
        if (tzResult && tzResult.length > 0) {
            timezone = tzResult[0];
            result.timezone = timezone;
        }

        // 2. Identify Region Name via Nominatim (Dual Fetch: Localized + English)
        const { fetchReverseGeocodeRaw } = await import('./geocoding');

        // Fetch in parallel for simple implementation
        const [addressEncoded, addressEn] = await Promise.all([
            fetchReverseGeocodeRaw(lat, lng, locale), // User Locale
            fetchReverseGeocodeRaw(lat, lng, 'en')    // Standard English
        ]);

        if (addressEncoded) {
            const mapped = mapNominatimAddress(addressEncoded);
            result = { ...result, ...mapped };
        }

        if (addressEn) {
            const mappedStandard = mapNominatimAddress(addressEn);
            std = {
                region0: mappedStandard.region0 || 'Unknown',
                region1: mappedStandard.region1 || 'Unknown',
                region2: mappedStandard.region2 || 'Unknown'
            };
        }

    } catch (e) {
        console.error('GPS Location Detection Failed:', e);
    }

    // Append std object to result (Partially)
    return { ...result, std };
}
