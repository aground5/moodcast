import { headers } from 'next/headers';
import { lookupIP, MAXMIND_SUPPORTED_LOCALES } from './geoip';
import { NominatimAddress, fetchGeocodeRaw } from './geocoding';

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

// Countries where "Subdivision" (Province/State) is the primary region, 
// and "City" is the secondary region.
const USE_SUBDIVISION_AS_REGION1 = ['KR', 'JP', 'CN', 'TW', 'VN', 'TR', 'MX', 'NG', 'ID', 'TH', 'RU', 'CD'];

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
            // Special Handling for Hierarchical Region Countries (e.g. KR, JP, CN, TW)
            // In these countries, MaxMind 'subdivision' is the primary region (e.g. Seoul, Tokyo),
            // and 'city' is the secondary region (e.g. Seodaemun-gu, Shinjuku).
            const countryCode = geoResult.countryCode || '';

            if (USE_SUBDIVISION_AS_REGION1.includes(countryCode) && geoResult.subdivision) {
                // Display Names
                city = geoResult.subdivision;
                region2 = geoResult.city;

                // Standard Names
                cityEn = geoResult.std.subdivision || geoResult.std.city; // Fallback to city if subd missing
                region2En = geoResult.std.city;
            } else {
                // Default West/Global Structure
                city = geoResult.city;
                region2 = 'Unknown';

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
 * Considers country-specific hierarchy rules defined in USE_SUBDIVISION_AS_REGION1.
 */
function mapNominatimAddress(addr: NominatimAddress): Partial<MoodcastLocation> {
    // geocodejson doesn't always have country_code in root props, sometimes it's implied.
    // However, geocoding.ts custom interface says we might have it or check raw? 
    // Nominatim geocodejson usually has `country_code` field.
    const countryCode = (addr.country_code || '').toUpperCase();

    const result: Partial<MoodcastLocation> = {
        region0: addr.country || 'Unknown'
    };

    const admin = addr.admin || {};

    // 1. Hierarchical Countries (KR, JP, CN, TW, VN)
    // Use Admin Levels: Level 4 is consistently Province/Metropolis.
    if (USE_SUBDIVISION_AS_REGION1.includes(countryCode)) {
        // Region1: Level 4 (Province/State/Metropolis)
        // If missing, fallback to city/state field.
        result.region1 = admin.level4 || addr.state || addr.province || addr.city || 'Unknown';

        // Region2: Level 6/7/8 (City/District)
        // Heuristic: Try specific levels known for these countries, or fallback to named fields.
        // JP: L4(Tokyo) -> L7(Shinjuku). 
        // KR: L4(Seoul) -> L6(Jung-gu).
        // VN: L4(HCMC) -> L6(Phuong.. wait L6 is Ward?). 
        // Let's use flat fields for Region2 as they are usually populated correctly for the "City/District" part
        // relative to the "State" part.
        // Or check lower levels.

        const candidateLv2 =
            admin.level6 ||
            admin.level7 ||
            admin.level8 ||
            addr.district ||
            addr.county ||
            addr.city ||
            'Unknown';

        // If R1 is same as candidate, try next?
        if (result.region1 === candidateLv2) {
            result.region2 = admin.level8 || admin.level9 || addr.suburb || 'Unknown';
        } else {
            result.region2 = candidateLv2;
        }

        // Special case: if R1 is "Unknown" but we have city, use city.
        if (result.region1 === 'Unknown' && addr.city) result.region1 = addr.city;

        return result;
    }

    // 2. Special Handling for London (GB)
    // admin.level5 is "Greater London".
    if (countryCode === 'GB') {
        if (admin.level5 === 'Greater London') { // This string is localized if input locale was used!
            // Wait, fetchReverseGeocodeRaw was called with locale...
            // So 'Greater London' might be '그레이터런던' in Korean.
            // checking "level5" value relies on the localized string.
            // Do we have an agnostic ID? IDs are not returned in simple geocodejson props.
            // However, "Greater London" is usually Level 5.
            // If Level 5 exists and Level 4 is England, it's likely a region.
            // For now, let's map Level 5 to Region1 if present for GB.
            // If Level 5 is 'Greater London' (or localized variant), we want R1='London'.
            // Issue: We don't know the localized string for 'Greater London' to match against.
            // But we know we want Level 5 as Region 1 for London.
            // And we want to force "London" text? 
            // For now, let's map Level 5 to Region 1 if present for GB.
            // If user really wants "London", we need English check which we do have in `std`?
            // But `mapNominatimAddress` only sees one version.

            // Let's accept `admin.level5` as R1.
            if (admin.level5) {
                result.region1 = admin.level5; // "Greater London"
                result.region2 = admin.level6 || admin.level7 || admin.level8 || addr.city || addr.district || 'Unknown'; // Borough
                return result;
            }
        }
    }

    // 3. Special Handling for Pakistan (PK) - Karachi/Lahore often at Level 6 (District)
    if (countryCode === 'PK') {
        // Use Level 6 (District) as primary Region1 (e.g. "Karachi District")
        // Can filter " District" suffix for cleaner display if desired, but "Karachi District" is accurate.
        // If Level 6 is missing, fallback to city.
        if (admin.level6) {
            result.region1 = admin.level6;
            result.region2 = admin.level7 || admin.level8 || addr.city || 'Unknown'; // Town
            return result;
        }
    }

    // 4. Default Strategy
    // R1: City / Level 5/6/8?
    // Generally flat fields `city` or `town` are reliable for West.
    result.region1 = addr.city || addr.town || addr.village || admin.level5 || admin.level6 || addr.state || 'Unknown';
    result.region2 = addr.borough || addr.district || addr.suburb || admin.level8 || admin.level9 || 'Unknown';

    return result;
}

/**
 * Helper to localize location using Nominatim Search.
 * Returns structured location data.
 */
export async function localizeLocationViaNominatim(queryCity: string, queryCountry: string, locale: string): Promise<Partial<MoodcastLocation> | null> {
    try {
        const query = `${queryCity}, ${queryCountry}`;

        // Use centralized, cached fetch
        const address = await fetchGeocodeRaw(query, locale);

        if (address) {
            return mapNominatimAddress(address);
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
