'use server';

import { createAdminClient } from '@/shared/lib/supabase/admin';
import { cookies, headers } from 'next/headers';

type VoteResult = {
    success: boolean;
    error?: string;
    region?: string;
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
                region1 = address.city || address.province || address.state || 'Unknown';
                region2 = address.borough || address.suburb || address.district || address.neighbourhood || 'Unknown';
            }
        } catch (e) {
            console.error('Reverse Geocoding Failed:', e);
        }
    }

    // Strategy B: Header Fallback (if strictly unknown)
    if (region1 === 'Unknown' || region1 === 'South Korea') {
        const headerStore = await headers();
        const city = headerStore.get('x-vercel-ip-city') || headerStore.get('cf-ipcity');

        if (city) {
            region1 = city;
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
    // Gender
    cookieStore.set('moodcast_gender', gender, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
    });

    // Last Voted Timestamp
    cookieStore.set('moodcast_last_voted_at', new Date().toISOString(), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
    });

    // 4. Broadcast Realtime Updates (Optimization: Don't await if we want faster response, but better to ensure it's sent)
    // We import dynamically or standard. Let's assume standard import.
    try {
        const { broadcastVote } = await import('../api/broadcastVote');
        // Fire and forget-ish, or await. Awaiting adds latency to the user's "Vote" action.
        // But Server Actions must succeed. Let's await to be safe for now, can optimize later.
        await broadcastVote(region2 !== 'Unknown' ? region2 : undefined);
    } catch (e) {
        console.error("Broadcast failed:", e);
        // Don't fail the vote just because broadcast failed
    }

    return {
        success: true,
        region: region2 !== 'Unknown' ? region2 : region1
    };
}
