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
export async function detectLocationFromHeaders(locale: string = 'ko'): Promise<MoodcastLocation> {
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
            country = geoResult.country;
            timezone = geoResult.timezone;

            // Localization Fallback:
            // MaxMind mostly supports: de, en, es, fr, ja, pt-BR, ru, zh-CN.
            // If the user's locale (e.g. ko) is NOT in MaxMind's list, we likely got the English name.
            // We should use Nominatim to translate this English name to the target locale.
            if (!MAXMIND_SUPPORTED_LOCALES.includes(locale) && city !== 'Unknown') {
                // Try to resolve "Seodaemun-gu" -> "서대문구"
                const localizedCity = await localizeCityViaNominatim(city, country, locale);
                if (localizedCity) city = localizedCity;

                // Also localize country name if needed
                if (country.length > 2) {
                    // MaxMind returns full name e.g. "South Korea".
                    // Nominatim/Intl might prefer codes, but let's try mapping common ones or use Intl if available?
                    // Intl.DisplayNames expects codes usually. "South Korea" isn't a code.
                    // But maybe we can leave country as english or map strict ones. 
                    // For now, focus on City.
                }
            }
        }
    }

    // 3. Fallback to Vercel Headers if MaxMind missed (e.g. private IP or missing DB data)
    if (city === 'Unknown') {
        const vCity = headerStore.get('x-vercel-ip-city') || headerStore.get('cf-ipcity');
        const vCountry = headerStore.get('x-vercel-ip-country') || headerStore.get('cf-ipcountry');
        const vTz = headerStore.get('x-vercel-ip-timezone') || headerStore.get('cf-timezone');

        if (vCity) city = vCity;
        if (vCountry) country = vCountry;
        if (vTz) timezone = vTz;

        // Apply fallback localization (Nominatim) ONLY if we fell back to Vercel Headers
        // (Since MaxMind handles localization itself if supported)
        if (city !== 'Unknown' && locale !== 'en') {
            const localizedCity = await localizeCityViaNominatim(city, country, locale);
            if (localizedCity) city = localizedCity;
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
 * Helper to localize city name using Nominatim Search.
 */
async function localizeCityViaNominatim(city: string, country: string, locale: string): Promise<string | null> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout

        // Add addressdetails=1 to get structured address back
        const query = `${city}, ${country}`;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&accept-language=${locale}&limit=1`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Moodcast/1.0' },
            next: { revalidate: 3600 }, // Cache result for 1 hour to reduce API load
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const addr = data[0].address;
                // Try to find the city-level name in the response
                return addr.city || addr.town || addr.village || addr.county || addr.district || addr.borough || city;
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
    let region0 = 'Unknown';
    let region1 = 'Unknown';
    let region2 = 'Unknown';

    try {
        // 1. Identify Timezone from Coordinates (Accurate)
        const { find } = await import('geo-tz');
        const tzResult = find(lat, lng);
        if (tzResult && tzResult.length > 0) {
            timezone = tzResult[0];
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
            const address = data.address;

            region0 = address.country || 'Unknown';
            region1 = address.city || address.province || address.state || 'Unknown';
            region2 = address.borough || address.suburb || address.district || address.neighbourhood || 'Unknown';
        }
    } catch (e) {
        console.error('GPS Location Detection Failed:', e);
    }

    return {
        region0,
        region1,
        region2,
        timezone // defined only if geo-tz succeeded
    };
}
