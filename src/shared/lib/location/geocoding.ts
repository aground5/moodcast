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
