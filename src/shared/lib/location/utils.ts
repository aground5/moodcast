import { NominatimAddress } from './geocoding';

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
export const USE_SUBDIVISION_AS_REGION1 = ['KR', 'JP', 'CN', 'TW', 'VN', 'TR', 'MX', 'NG', 'ID', 'TH', 'RU', 'CD'];

/**
 * Maps Nominatim address structure to Moodcast region levels.
 * Rules:
 * Lv0 (Country) = country
 * Lv1 (City)    = city (primary) > town > village > province > state
 * Considers country-specific hierarchy rules defined in USE_SUBDIVISION_AS_REGION1.
 */
export function mapNominatimAddress(addr: NominatimAddress): Partial<MoodcastLocation> {
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
    const { fetchGeocodeRaw } = await import('./geocoding'); // Dynamic Import or Move to geocoding?
    // Previously geocoding.ts exported fetchGeocodeRaw.
    // utils can import from geocoding safely.
    // I can make it static import.
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
