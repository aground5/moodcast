import HomePage from '@/views/home/HomePage';
import { cookies, headers } from 'next/headers';

import { createAdminClient } from '@/shared/lib/supabase/admin';

export default async function Page() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('moodcast_uid')?.value;

    let hasVoted = false;

    let initialVote = null;

    // 3. IP Location & Timezone (for initial display)
    const { getLocale } = await import('next-intl/server');
    const locale = await getLocale();
    const { detectLocationFromHeaders } = await import('@/shared/lib/location');
    const { timezone, region1, region0 } = await detectLocationFromHeaders(locale);

    // Initial display region preference: City -> Country -> Korea
    let ipRegion = region1 !== 'Unknown' ? region1 : (region0 !== 'Unknown' ? region0 : "대한민국");

    // 4. Optimization: Check Cookie Timestamp (Timezone Aware)
    // Dynamic import to avoid build cyclic dependency if any
    const { getStartOfDayUTC } = await import('@/shared/lib/date/timezone');
    const startOfTodayUTC = getStartOfDayUTC(timezone);

    // If the cookie indicates the last vote was BEFORE "Start of Today (in User TZ)",
    // we can safely assume they haven't voted today without querying the DB.
    let shouldFetchDB = true;
    const lastVotedAt = cookieStore.get('moodcast_last_voted_at')?.value;

    if (userId && lastVotedAt) {
        const lastVotedDate = new Date(lastVotedAt);
        const startOfTodayDate = new Date(startOfTodayUTC);

        // If last vote was older than today's start
        if (lastVotedDate < startOfTodayDate) {
            shouldFetchDB = false;
        }
    }

    // 2. DB Check / Fetch
    if (userId && shouldFetchDB) {
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
