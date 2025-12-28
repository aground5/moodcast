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
    const { timezone, region1, region0, std } = await detectLocationFromHeaders(locale);

    // Initial display region preference:
    // ...
    // And we pass region1 (English City) as a hidden prop for client-side sticky refinement.
    let ipRegion = region0 !== 'Unknown' ? region0 : "대한민국";
    // We pass standard names for refinement & consistency
    let initialCity = region1 !== 'Unknown' ? region1 : undefined;
    let initialCityStd = std?.region1 !== 'Unknown' ? std.region1 : undefined;
    let ipRegionStd = std?.region0 !== 'Unknown' ? std.region0 : "South Korea"; // Default English Country

    // ...

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
            .select('mood, gender, created_at, region_lv2, region_lv1, region_lv0, region_std_lv2, region_std_lv1, region_std_lv0, analysis_text')
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

    // 4. SSR Analysis & Stats
    let initialAnalysis: string | undefined;
    let initialStats: any = null; // Type: DashboardStats

    if (hasVoted && initialVote) {
        // Always fetch stats for the dashboard to avoid client-side "Global" flash
        const { getDashboardStats } = await import('@/widgets/dashboard/actions/getDashboardStats');
        // Pass standard names if available to ensure accurate matching
        initialStats = await getDashboardStats({
            region_lv2: initialVote.region_lv2 || undefined,
            region_lv1: initialVote.region_lv1 || undefined,
            region_lv0: initialVote.region_lv0 || undefined,
            region_std_lv2: initialVote.region_std_lv2 || undefined,
            region_std_lv1: initialVote.region_std_lv1 || undefined,
            region_std_lv0: initialVote.region_std_lv0 || undefined
        }, timezone);

        // ... logic unchanged ...
    }

    return <HomePage
        initialStep={initialStep}
        savedGender={savedGender}
        initialVote={initialVote}
        ipRegion={ipRegion}
        ipRegionStd={ipRegionStd} // Pass standard region
        initialCountry={region0}
        initialCity={initialCity}
        initialCityStd={initialCityStd} // Pass standard city for refinement
        initialAnalysis={initialAnalysis}
        initialStats={initialStats}
    />;
}
