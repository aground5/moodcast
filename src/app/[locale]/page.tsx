import HomePage from '@/views/home/HomePage';
import { cookies, headers } from 'next/headers';

import { createAdminClient } from '@/shared/lib/supabase/admin';

export default async function Page() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('moodcast_uid')?.value;

    let hasVoted = false;

    let initialVote = null;

    // 3. IP Location & Timezone (for initial display)
    let ipRegion = "대한민국"; // Default
    let timezone = 'Asia/Seoul'; // Default

    const headerStore = await headers();
    const city = headerStore.get('x-vercel-ip-city') || headerStore.get('cf-ipcity');
    const country = headerStore.get('x-vercel-ip-country') || headerStore.get('cf-ipcountry');
    const tzHeader = headerStore.get('x-vercel-ip-timezone') || headerStore.get('cf-timezone');

    if (city) ipRegion = city;
    else if (country) ipRegion = country;

    if (tzHeader) timezone = tzHeader;

    // 1. Optimization: Check Cookie Timestamp first
    // (Note: Cookie logic might need to be timezone aware too, but let's assume cookie expiry handles "24h" naturally?
    // No, logic was "is it today?". 
    // We should parse the cookie timestamp in the USER'S timezone to see if it matches "today".
    // For now, let's rely on DB truth for strictness.)

    // Dynamic import to avoid build cyclic dependency if any
    const { getStartOfDayUTC } = await import('@/shared/lib/date/timezone');
    const startOfTodayUTC = getStartOfDayUTC(timezone);

    // 2. DB Check / Fetch
    // We need the details (mood, gender) anyway for the Dashboard.
    if (userId) {
        const supabase = createAdminClient();

        const { data } = await supabase
            .from('mood_votes')
            .select('mood, gender, created_at, region_lv2, analysis_text')
            .eq('user_id', userId)
            .gte('created_at', startOfTodayUTC)
            .limit(1)
            .single();

        if (data) {
            hasVoted = true;
            initialVote = data;
        }
    }

    const savedGender = cookieStore.get('moodcast_gender')?.value as 'male' | 'female' | undefined;
    const initialStep = hasVoted ? 'result' : 'gender';

    // 4. SSR Analysis (Stable Message)
    let initialAnalysis: string | undefined;
    if (hasVoted && initialVote) {
        // Priority 1: Use Persisted Text (DB)
        if (initialVote.analysis_text) {
            initialAnalysis = initialVote.analysis_text;
        } else {
            // Priority 2: Legacy / Fallback Generation
            const { getDashboardStats } = await import('@/widgets/dashboard/actions/getDashboardStats');
            const { analyzeScenario } = await import('@/widgets/dashboard/lib/AnalysisEngine');

            // Fetch stats for the context
            // Note: Old votes might not have region_lv0, but that's fine (graceful degrade to global if lv2 empty)
            const stats = await getDashboardStats({
                region_lv2: initialVote.region_lv2 || undefined,
                // Cast to any because we haven't updated the TS definition of data row fully in this file, 
                // but runtime data might have it. Or fallback.
                region_lv0: (initialVote as any).region_lv0 || undefined
            }, timezone);

            // Generate the stable string
            initialAnalysis = analyzeScenario(
                initialVote.gender as 'male' | 'female',
                initialVote.mood as 'good' | 'bad',
                stats
            );
        }
    }

    return <HomePage
        initialStep={initialStep}
        savedGender={savedGender}
        initialVote={initialVote}
        ipRegion={ipRegion}
        initialAnalysis={initialAnalysis}
    />;
}
