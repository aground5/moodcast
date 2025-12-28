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

export async function reverseGeocode(lat: number, lng: number, locale: string = 'ko'): Promise<string | null> {
    const address = await fetchReverseGeocodeRaw(lat, lng, locale);
    if (!address) return null;

    // Same logic as server-side
    const region1 = address.city || address.province || address.state;
    const region2 = address.borough || address.suburb || address.district || address.neighbourhood;

    return region2 || region1 || null;
}
