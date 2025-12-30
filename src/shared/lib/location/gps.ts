'use server';

import { find } from 'geo-tz';
import { MoodcastLocation, mapNominatimAddress } from './utils';
import { fetchReverseGeocodeRaw } from './geocoding';

/**
 * Detects location and timezone from GPS coordinates (High Precision).
 * Uses `geo-tz` for timezone and OpenStreetMap (Nominatim) for address.
 * 
 * This must be a Server Action because `geo-tz` relies on Node.js `fs` module.
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
        const tzResult = find(lat, lng);
        if (tzResult && tzResult.length > 0) {
            timezone = tzResult[0];
            result.timezone = timezone;
        }

        // 2. Identify Region Name via Nominatim (Dual Fetch: Localized + English)
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
