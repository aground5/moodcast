import HomePage from '@/views/home/HomePage';
import { cookies, headers } from 'next/headers';

import { createAdminClient } from '@/shared/lib/supabase/admin';

export default async function Page() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('moodcast_uid')?.value;

    let hasVoted = false;

    let initialVote = null;

    // 1. Optimization: Check Cookie Timestamp first
    const lastVotedAt = cookieStore.get('moodcast_last_voted_at')?.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. DB Check / Fetch
    // We need the details (mood, gender) anyway for the Dashboard.
    if (userId) {
        const supabase = createAdminClient();

        const { data } = await supabase
            .from('mood_votes')
            .select('mood, gender, created_at, region_lv2')
            .eq('user_id', userId)
            .gte('created_at', today.toISOString())
            .limit(1)
            .single();

        if (data) {
            hasVoted = true;
            initialVote = data;
        }
    }

    // 3. IP Location Fallback (for initial display)
    let ipRegion = "대한민국"; // Default
    const headerStore = await headers();
    const city = headerStore.get('x-vercel-ip-city') || headerStore.get('cf-ipcity');
    if (city) {
        // Simple mapping or just use city directly (often in English, might need Translation dict/logic later)
        // For now, pass it as is. In real prod, we'd map "Seoul" -> "서울" etc.
        ipRegion = city;
    }

    const savedGender = cookieStore.get('moodcast_gender')?.value as 'male' | 'female' | undefined;
    const initialStep = hasVoted ? 'result' : 'gender';

    return <HomePage initialStep={initialStep} savedGender={savedGender} initialVote={initialVote} ipRegion={ipRegion} />;
}
