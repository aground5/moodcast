// Shared Nominatim Fetch Logic
export async function fetchReverseGeocodeRaw(lat: number, lng: number, locale: string = 'ko') {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${locale}`,
            {
                headers: {
                    'User-Agent': 'Moodcast/1.0',
                }
            }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.address;
    } catch (error) {
        console.error("Nominatim fetch failed:", error);
        return null;
    }
}

export interface ReverseGeocodeResult {
    localized: string | null;
    std: string | null;
}

export async function reverseGeocode(lat: number, lng: number, locale: string = 'ko'): Promise<ReverseGeocodeResult | null> {
    const [addressEncoded, addressEn] = await Promise.all([
        fetchReverseGeocodeRaw(lat, lng, locale),
        fetchReverseGeocodeRaw(lat, lng, 'en')
    ]);

    if (!addressEncoded && !addressEn) return null;

    // Localized Name
    let localized = null;
    if (addressEncoded) {
        const region1 = addressEncoded.city || addressEncoded.province || addressEncoded.state;
        const region2 = addressEncoded.borough || addressEncoded.suburb || addressEncoded.district || addressEncoded.neighbourhood;
        localized = region2 || region1 || null;
    }

    // Standard Name
    let std = null;
    if (addressEn) {
        const region1 = addressEn.city || addressEn.province || addressEn.state;
        const region2 = addressEn.borough || addressEn.suburb || addressEn.district || addressEn.neighbourhood;
        std = region2 || region1 || null;
    }

    return { localized, std };
}

// Forward Geocoding: Name -> Standard Structure
export async function fetchGeocodeRaw(query: string, locale: string = 'ko') {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=${locale}&addressdetails=1&limit=1`,
            {
                headers: { 'User-Agent': 'Moodcast/1.0' }
            }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data[0]?.address || null;
    } catch (error) {
        console.error("Nominatim search failed:", error);
        return null;
    }
}

export async function searchRegion(query: string, locale: string = 'ko') {
    const address = await fetchGeocodeRaw(query, locale);
    if (!address) return null;

    // Use English for Standard Mapping
    // This is tricky: we searched in `locale`, so `address` has localized keys usually.
    // To get standard names, we might need to search again or rely on Nominatim behavior.
    // Actually, asking for `accept-language=en` provides standard names.

    // Better approach: Search 2 times or trust the user input workflow?
    // Let's search with 'en' to get standard structure directly if we want `region_std`.
    const addressEn = await fetchGeocodeRaw(query, 'en');

    if (!addressEn) return null; // Fallback if no english result

    const std_lv1 = addressEn.city || addressEn.province || addressEn.state || null;
    const std_lv2 = addressEn.borough || addressEn.suburb || addressEn.district || addressEn.neighbourhood || null;
    const std_lv0 = addressEn.country || null;

    return { std_lv0, std_lv1, std_lv2 };
}
