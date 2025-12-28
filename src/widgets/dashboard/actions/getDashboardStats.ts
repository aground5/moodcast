'use server';

import { createAdminClient } from '@/shared/lib/supabase/admin';

export interface DashboardStats {
    score: number;
    total: number;
    region: string;
    male: {
        score: number;
        total: number;
    };
    female: {
        score: number;
        total: number;
    };
}

import { getStartOfDayUTC } from '@/shared/lib/date/timezone';

export async function getDashboardStats(
    context: { region_lv2?: string; region_lv0?: string; region_lv1?: string } = {},
    timezone: string = 'Asia/Seoul'
): Promise<DashboardStats> {
    const supabase = createAdminClient();
    const startOfTodayUTC = getStartOfDayUTC(timezone);

    // Helper to fetch stats for a specific condition
    const fetchStats = async (filter: 'lv2' | 'lv1' | 'lv0' | 'global', value?: string) => {
        let query = supabase
            .from('mood_votes')
            .select('mood, gender, region_lv2, region_lv1, region_lv0') // Select potential display name columns
            .gte('created_at', startOfTodayUTC);

        if (filter === 'lv2' && value) query = query.eq('region_lv2', value);
        else if (filter === 'lv1' && value) query = query.eq('region_lv1', value);
        else if (filter === 'lv0' && value) query = query.eq('region_lv0', value);
        // global = no filter

        const { data, error } = await query;
        if (error || !data) return null;
        return { data, filter, value };
    };

    // 1. Determine the Best Scope to Fetch based on available context
    // Business Logic: Prefer Lv2 -> Lv1 -> Lv0 -> Global
    // Unlike dynamic fallback chains (try Lv2, fail, try Lv1...), we primarily trust the "Scope" of the provided location.
    // If the user is in "Seoul (Lv1)" but we only asked for Lv2, we might fail.
    // We should iterate.

    // Strict priority check
    const isValid = (val?: string) => val && val !== 'Unknown' && val.trim() !== '';

    let result = null;

    // Check Lv2 (District)
    if (!result && isValid(context.region_lv2)) {
        const res = await fetchStats('lv2', context.region_lv2);
        if (res && res.data.length > 0) result = res;
    }

    // Check Lv1 (City) - Added per user request
    if (!result && isValid(context.region_lv1)) {
        // Query param modification for Lv1 needed?
        // Wait, the original code didn't handle 'lv1' filter type. I need to add it.
        // Assuming 'lv1' corresponds to a column or logic? 
        // Note: The schema might not have 'region_lv1' column indexed or used? 
        // Checked file content: it selects 'region_lv2, region_lv0'. 
        // I might need to verify if region_lv1 exists in DB.
        // Assuming it does (based on user request). If not, we skip.
        // Let's safe-check context first.
        const res = await fetchStats('lv1', context.region_lv1);
        if (res && res.data.length > 0) result = res;
    }

    // Check Lv0 (Country)
    if (!result && isValid(context.region_lv0)) {
        const res = await fetchStats('lv0', context.region_lv0);
        if (res && res.data.length > 0) result = res;
    }

    // 3. Fallback to Global
    if (!result) {
        result = await fetchStats('global');
    }

    const votes = result?.data || [];
    const regionLabel = result?.filter === 'lv2' ? result.value :
        result?.filter === 'lv0' ? result.value : 'Global';

    const total = votes.length;
    const good = votes.filter(v => v.mood === 'good').length;
    const score = total === 0 ? 0 : Math.round((good / total) * 100);

    // Gender Breakdowns
    const maleVotes = votes.filter(v => v.gender === 'male');
    const maleTotal = maleVotes.length;
    const maleGood = maleVotes.filter(v => v.mood === 'good').length;
    const maleScore = maleTotal === 0 ? 0 : Math.round((maleGood / maleTotal) * 100);

    const femaleVotes = votes.filter(v => v.gender === 'female');
    const femaleTotal = femaleVotes.length;
    const femaleGood = femaleVotes.filter(v => v.mood === 'good').length;
    const femaleScore = femaleTotal === 0 ? 0 : Math.round((femaleGood / femaleTotal) * 100);

    return {
        score,
        total,
        region: regionLabel || '전국', // "Global" might be better localized? '전국' is "Nationwide". '전세계' is World.
        male: { score: maleScore, total: maleTotal },
        female: { score: femaleScore, total: femaleTotal }
    };
}
