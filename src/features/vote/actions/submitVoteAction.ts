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

    // 1. Determine Location & Timezone
    let region0 = 'Unknown';
    let region1 = 'Unknown';
    let region2 = 'Unknown';
    let lat = coords?.lat;
    let lng = coords?.lng;
    let timezone = 'Asia/Seoul'; // Default

    // Get Locale for robust/universal name resolution (e.g. "Seodaemun-gu" -> "서대문구" if ki)
    const { getLocale } = await import('next-intl/server');
    const locale = await getLocale();

    const { detectLocationFromGPS, detectLocationFromHeaders } = await import('@/shared/lib/location');

    // Strategy A: GPS / Nominatim (if coords provided)
    if (lat && lng) {
        const gpsData = await detectLocationFromGPS(lat, lng, locale);
        if (gpsData.region0) region0 = gpsData.region0;
        if (gpsData.region1) region1 = gpsData.region1;
        if (gpsData.region2) region2 = gpsData.region2;
        if (gpsData.timezone) timezone = gpsData.timezone;
    }

    // Strategy B: Header Fallback & Timezone (Unified)
    // If we are missing Timezone OR Location, we fetch header data ONE TIME with localization enabled.
    let headerData = null;

    const needTimezone = (!timezone || timezone === 'Asia/Seoul');
    const needLocation = (region1 === 'Unknown' || region1 === region0);

    if (needTimezone || needLocation) {
        headerData = await detectLocationFromHeaders(locale, { skipLocalization: false });
    }

    // Apply Timezone from Header Data
    if (needTimezone && headerData) {
        if (headerData.timezone && headerData.timezone !== 'Asia/Seoul') {
            timezone = headerData.timezone;
        }
    }

    // Apply Location from Header Data
    if (needLocation && headerData) {
        // If we don't have country, take it from headers
        if (region0 === 'Unknown') region0 = headerData.region0;

        // If we need better city specificity
        if (headerData.region1 !== 'Unknown') {
            // If we currently have nothing, or just country -> take header city
            if (region1 === 'Unknown' || region1 === region0) {
                region1 = headerData.region1;
            }
        } else if (headerData.region0 !== 'Unknown') {
            // Header only has country
            if (region1 === 'Unknown') region1 = headerData.region0;
        }
    }


    // 1.5. Generate Persistent Analysis (Server-Side)
    let analysis_text: string | null = null;
    try {
        const { getDashboardStats } = await import('@/widgets/dashboard/actions/getDashboardStats');
        const { analyzeScenario } = await import('@/widgets/dashboard/lib/AnalysisEngine');

        // Fetch CURRENT stats: Region Fallback (Region -> Country -> World)
        // We pass the hierarchy context; the function handles the waterfall.
        const currentStats = await getDashboardStats({
            region_lv2: region2 !== 'Unknown' ? region2 : undefined,
            region_lv0: region0 !== 'Unknown' ? region0 : undefined,
            region_lv1: region1 !== 'Unknown' ? region1 : undefined,
        }, timezone);

        // Manually apply this vote to the stats (In-Memory Simulation) for accurate N=1 analysis
        const isMale = gender === 'male';
        const isGood = mood === 'good';

        // Clone to avoid mutating if it were a shared object (it's not, but good practice)
        const nextStats = { ...currentStats };
        nextStats.total += 1;
        if (isGood) nextStats.score = Math.round(((nextStats.score * currentStats.total / 100) + 1) / nextStats.total * 100);

        if (isMale) {
            const oldTotal = nextStats.male.total;
            const oldGood = Math.round(nextStats.male.score * oldTotal / 100);
            nextStats.male.total += 1;
            nextStats.male.score = Math.round(((oldGood + (isGood ? 1 : 0)) / nextStats.male.total) * 100);
        } else {
            const oldTotal = nextStats.female.total;
            const oldGood = Math.round(nextStats.female.score * oldTotal / 100);
            nextStats.female.total += 1;
            nextStats.female.score = Math.round(((oldGood + (isGood ? 1 : 0)) / nextStats.female.total) * 100);
        }

        // Generate Analysis
        analysis_text = analyzeScenario(gender, mood, nextStats);

    } catch (e) {
        console.error("Analysis generation failed:", e);
        // Fallback: DB will store null, client can regenerate or show default
    }

    // 2. Insert into DB
    const supabase = createAdminClient();
    const { error } = await supabase.from('mood_votes').insert({
        gender,
        mood,
        user_id: userId,
        lat,
        lng,
        region_lv0: region0,
        region_lv1: region1,
        region_lv2: region2,
        ip_hash: 'server-action',
        analysis_text, // Persist the generated text
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
        await broadcastVote(region2 !== 'Unknown' ? region2 : undefined, timezone);
    } catch (e) {
        console.error("Broadcast failed:", e);
        // Don't fail the vote just because broadcast failed
    }

    return {
        success: true,
        region: region2 !== 'Unknown' ? region2 : region1
    };
}
