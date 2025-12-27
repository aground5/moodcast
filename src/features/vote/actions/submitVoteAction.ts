'use server';

import { createAdminClient } from '@/shared/lib/supabase/admin';
import { cookies, headers } from 'next/headers';

type VoteResult = {
    success: boolean;
    error?: string;
};

export async function submitVoteAction(
    gender: 'male' | 'female',
    mood: 'good' | 'bad',
    coords?: { lat: number; lng: number }
): Promise<VoteResult> {
    const cookieStore = await cookies();
    const userId = cookieStore.get('moodcast_uid')?.value;

    if (!userId) {
        return { success: false, error: 'User ID missing' };
    }

    // 1. Determine Location
    let region1 = 'Unknown';
    let region2 = 'Unknown';
    let lat = coords?.lat;
    let lng = coords?.lng;

    // Strategy A: Reverse Geocoding (if coords provided)
    if (lat && lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        'User-Agent': 'Moodcast/1.0', // Required by OSM
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                const address = data.address;

                // Map OSM address fields to Korean administrative divisions
                // Seoul -> city
                // Mapo-gu -> borough, suburb, district?
                // Fallbacks are tricky with OSM structure variability

                region1 = address.city || address.province || address.state || 'Unknown';
                region2 = address.borough || address.suburb || address.district || address.neighbourhood || 'Unknown';

                // Simple Mapping for Seoul/Korea common cases if needed (OSM returns English often in params?)
                // Ideally we requested accept-language
            }
        } catch (e) {
            console.error('Reverse Geocoding Failed:', e);
        }
    }

    // Strategy B: Header Fallback (if strictly unknown)
    // Check headers if regions are still unknown
    if (region1 === 'Unknown' || region1 === 'South Korea') { // OSM often gives Country as state for some reason?
        const headerStore = await headers();
        const city = headerStore.get('x-vercel-ip-city') || headerStore.get('cf-ipcity');
        const country = headerStore.get('x-vercel-ip-country') || headerStore.get('cf-ipcountry');

        if (city) {
            region1 = city;
            // If we have city but no drilled down info, set region2 to city too or leave unknown
            if (region2 === 'Unknown') region2 = city;
        }
    }

    // 2. Insert into DB
    const supabase = createAdminClient();
    const { error } = await supabase.from('mood_votes').insert({
        gender,
        mood,
        user_id: userId,
        lat,
        lng,
        region_lv1: region1,
        region_lv2: region2,
        ip_hash: 'server-action', // Placeholder/TODO
    });

    if (error) {
        console.error('DB Insert Error:', error);
        return { success: false, error: error.message };
    }

    // 3. Set Cookies (Server-Side Persistence)
    // Gender Cookie (1 Year)
    cookieStore.set('moodcast_gender', gender, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false, // Accessible to client if needed
    });

    // Last Voted Timestamp (1 Year) - For Optimization
    cookieStore.set('moodcast_last_voted_at', new Date().toISOString(), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false, // Accessible to client logic
    });

    return { success: true };
}
