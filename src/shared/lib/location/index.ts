import { headers } from 'next/headers';
import { lookupIP, MAXMIND_SUPPORTED_LOCALES } from './geoip';

export type MoodcastLocation = {
    region0: string; // Country
    region1: string; // City/State
    region2: string; // District/Borough
    timezone: string;
};

/**
 * Detects location and timezone.
 * Priority: MaxMind GeoIP (Local DB) -> Vercel Headers -> Unknown
 */
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
    let timezone = 'Asia/Seoul';

    // 2. Try MaxMind GeoIP
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const geoResult = await lookupIP(ip, locale);
        if (geoResult) {
            city = geoResult.city;
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
            timezone = geoResult.timezone;

            // Localization Fallback (Nominatim)
            // DISABLED by default for performance on initial load.
            // ENABLED explicitly when called with skipLocalization: false (e.g. Voting Action)
            if (!options.skipLocalization && !MAXMIND_SUPPORTED_LOCALES.includes(locale) && city !== 'Unknown') {
                const localized = await localizeLocationViaNominatim(city, country, locale);
                if (localized && localized.region1 && localized.region1 !== 'Unknown') {
                    city = localized.region1;
                }
            }
        }
    }

    // 3. Fallback to Vercel Headers if MaxMind missed
    if (city === 'Unknown') {
        const vCity = headerStore.get('x-vercel-ip-city') || headerStore.get('cf-ipcity');
        const vCountry = headerStore.get('x-vercel-ip-country') || headerStore.get('cf-ipcountry');
        const vTz = headerStore.get('x-vercel-ip-timezone') || headerStore.get('cf-timezone');

        if (vCity) city = vCity;
        if (vCountry) country = vCountry;
        if (vTz) timezone = vTz;

        // Apply fallback localization (Nominatim) ONLY if enabled
        if (!options.skipLocalization && city !== 'Unknown' && locale !== 'en') {
            const localized = await localizeLocationViaNominatim(city, country, locale);
            if (localized) {
                if (localized.region1 && localized.region1 !== 'Unknown') city = localized.region1;
            }
        }

        // Also localize Country code if it came from Vercel
        if (country.length === 2) {
            try {
                const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
                country = regionNames.of(country) || country;
            } catch (e) { }
        }
    }

    return {
        region0: country,
        region1: city !== 'Unknown' ? city : country, // Fallback to country if city unknown
        region2: clickToRegion2(city), // Heuristic: City often maps to Lv2 in simple view, or stays Unknown
        timezone
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

    try {
        // 1. Identify Timezone from Coordinates (Accurate)
        const { find } = await import('geo-tz');
        const tzResult = find(lat, lng);
        if (tzResult && tzResult.length > 0) {
            timezone = tzResult[0];
            result.timezone = timezone;
        }

        // 2. Identify Region Name via Nominatim
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${locale}`,
            {
                headers: {
                    'User-Agent': 'Moodcast/1.0',
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.address) {
                const mapped = mapNominatimAddress(data.address);
                result = { ...result, ...mapped };
            }
        }
    } catch (e) {
        console.error('GPS Location Detection Failed:', e);
    }

    return result;
}
