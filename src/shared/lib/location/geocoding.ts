import { redis, CACHE_TTL } from '../redis';

export interface NominatimAddress {
    label?: string;
    name?: string;
    housenumber?: string;
    street?: string;
    postcode?: string;
    city?: string;
    town?: string; // Sometimes present
    district?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string; // Sometimes not in geocoding root, check raw response? No, geocodejson might not have it in root.
    // admin hierarchy
    admin?: {
        level1?: string;
        level2?: string; // Country usually
        level3?: string;
        level4?: string; // Province/State usually
        level5?: string; // Region (e.g. Greater London)
        level6?: string; // County/City
        level7?: string; // Municipality
        level8?: string; // City/District
        level9?: string;
        level10?: string;
        [key: string]: string | undefined;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

// Shared Nominatim Fetch Logic
export async function fetchReverseGeocodeRaw(lat: number, lng: number, locale: string = 'ko'): Promise<NominatimAddress | null> {
    const cacheKey = `geo:reverse:v2:${lat.toFixed(6)}:${lng.toFixed(6)}:${locale}`; // Updated properties key

    try {
        // Try Cache
        if (process.env.UPSTASH_REDIS_REST_URL) {
            const cached = await redis.get<NominatimAddress>(cacheKey);
            if (cached) return cached;
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=geocodejson&lat=${lat}&lon=${lng}&accept-language=${locale}`,
            {
                headers: {
                    'User-Agent': 'Moodcast/1.0',
                }
            }
        );
        if (!response.ok) return null;
        const data = await response.json();

        // geocodejson structure:
        // { type: "FeatureCollection", features: [ { properties: { geocoding: { ... } } } ] }
        const geocoding = data.features?.[0]?.properties?.geocoding;

        if (!geocoding) return null;

        // Save to Cache
        if (process.env.UPSTASH_REDIS_REST_URL) {
            await redis.set(cacheKey, geocoding, { ex: CACHE_TTL });
        }

        return geocoding;
    } catch (error) {
        console.error("Nominatim fetch failed:", error);
        return null;
    }
}

// Forward Geocoding: Name -> Standard Structure
export async function fetchGeocodeRaw(query: string, locale: string = 'ko'): Promise<NominatimAddress | null> {
    const cacheKey = `geo:search:v2:${query.toLowerCase().trim()}:${locale}`;

    try {
        // Try Cache
        if (process.env.UPSTASH_REDIS_REST_URL) {
            const cached = await redis.get<NominatimAddress>(cacheKey);
            if (cached) return cached;
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=geocodejson&q=${encodeURIComponent(query)}&accept-language=${locale}&limit=1&addressdetails=1`,
            {
                headers: { 'User-Agent': 'Moodcast/1.0' }
            }
        );
        if (!response.ok) return null;
        const data = await response.json();

        // geocodejson: { features: [ { properties: { geocoding: { ... } } } ] }
        const geocoding = data.features?.[0]?.properties?.geocoding;

        if (!geocoding) return null;

        // Save to Cache
        // Save to Cache
        if (process.env.UPSTASH_REDIS_REST_URL) {
            await redis.set(cacheKey, geocoding, { ex: CACHE_TTL });
        }

        return geocoding;
    } catch (error) {
        console.error("Nominatim search failed:", error);
        return null;
    }
}
