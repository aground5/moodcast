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
    const fetchStats = async (filter: 'lv2' | 'lv0' | 'global', value?: string) => {
        let query = supabase
            .from('mood_votes')
            .select('mood, gender, region_lv2, region_lv0') // Select potential display name columns
            .gte('created_at', startOfTodayUTC);

        if (filter === 'lv2' && value) query = query.eq('region_lv2', value);
        else if (filter === 'lv0' && value) query = query.eq('region_lv0', value);
        // global = no filter

        const { data, error } = await query;
        if (error || !data) return null;
        return { data, filter, value };
    };

    // 1. Try Specific Region (LV2)
    let result = null;
    if (context.region_lv2 && context.region_lv2 !== 'Unknown') {
        const res = await fetchStats('lv2', context.region_lv2);
        // Threshold: e.g. at least 3 votes to show specific regional stats? 
        // For now, if > 0, we take it. Or user might want strict 0 fallback.
        // Let's assume if it exists (length > 0), it's good.
        if (res && res.data.length > 0) result = res;
    }

    // 2. Fallback to Country (LV0)
    if (!result && context.region_lv0 && context.region_lv0 !== 'Unknown') {
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
