export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    // It's good practice to identify output, but browser might restrict custom headers in simple GETs or CORS.
                    // Nominatim usually requires User-Agent. Browser sends User-Agent automatically.
                    // But standard fetch might need explicit handling or just depend on browser.
                    // Let's try simple fetch first.
                }
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        const address = data.address;

        // Same logic as server-side
        const region1 = address.city || address.province || address.state;
        const region2 = address.borough || address.suburb || address.district || address.neighbourhood;

        return region2 || region1 || null;
    } catch (error) {
        console.error("Client-side geocoding failed:", error);
        return null;
    }
}
