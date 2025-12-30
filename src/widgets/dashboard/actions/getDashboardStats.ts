'use server';

import { createAdminClient } from '@/shared/lib/supabase/admin';
import { getStartOfDayUTC } from '@/shared/lib/date/timezone';

export interface DashboardStats {
    score: number;
    total: number;
    region: string;
    region_std?: string; // Standard English Name for Realtime Channel
    male: {
        score: number;
        total: number;
    };
    female: {
        score: number;
        total: number;
    };
}

export async function getDashboardStats(
    context: {
        region_lv2?: string; region_lv0?: string; region_lv1?: string;
        region_std_lv2?: string; region_std_lv0?: string; region_std_lv1?: string;
    } = {},
    timezone: string = 'Asia/Seoul'
): Promise<DashboardStats> {
    const supabase = createAdminClient();
    const startOfTodayUTC = getStartOfDayUTC(timezone);

    // Helper to fetch stats
    // We only support querying by Standard English Names now
    const fetchStats = async (filter: 'lv2' | 'lv1' | 'lv0' | 'global', valueStd?: string) => {
        let query = supabase
            .from('mood_votes')
            .select('mood, gender, region_lv2, region_lv1, region_lv0, region_std_lv2, region_std_lv1, region_std_lv0')
            .gte('created_at', startOfTodayUTC);

        if (filter === 'lv2' && valueStd) {
            query = query.eq('region_std_lv2', valueStd);
        }
        else if (filter === 'lv1' && valueStd) {
            query = query.eq('region_std_lv1', valueStd);
        }
        else if (filter === 'lv0' && valueStd) {
            query = query.eq('region_std_lv0', valueStd);
        }
        else if (filter !== 'global') {
            return null; // Invalid call
        }

        const { data, error } = await query;
        if (error || !data) return null;
        return { data, filter, valueStd };
    };

    let result = null;

    // 1. Try Lv2 (District)
    if (context.region_std_lv2) {
        result = await fetchStats('lv2', context.region_std_lv2);
    }

    // 2. Try Lv1 (City) - Fallback from Lv2 or Direct Request
    // Only if previous attempt failed to find data
    if ((!result || result.data.length === 0) && context.region_std_lv1) {
        result = await fetchStats('lv1', context.region_std_lv1);
    }

    // 3. Try Lv0 (Country)
    if ((!result || result.data.length === 0) && context.region_std_lv0) {
        result = await fetchStats('lv0', context.region_std_lv0);
    }

    // 4. Global Fallback
    if (!result || result.data.length === 0) {
        result = await fetchStats('global');
    }

    const votes = result?.data || [];
    const total = votes.length;
    const good = votes.filter(v => v.mood === 'good').length;
    const score = total === 0 ? 100 : Math.round((good / total) * 100);

    // Gender Breakdowns
    const maleVotes = votes.filter(v => v.gender === 'male');
    const maleTotal = maleVotes.length;
    const maleGood = maleVotes.filter(v => v.mood === 'good').length;
    const maleScore = maleTotal === 0 ? 100 : Math.round((maleGood / maleTotal) * 100);

    const femaleVotes = votes.filter(v => v.gender === 'female');
    const femaleTotal = femaleVotes.length;
    const femaleGood = femaleVotes.filter(v => v.mood === 'good').length;
    const femaleScore = femaleTotal === 0 ? 100 : Math.round((femaleGood / femaleTotal) * 100);

    // Determine Labels
    let regionLabel = '전세계'; // Default Global Label (Localized Fallback)
    let regionStd = 'global'; // Lowercase 'global' for frontend check

    if (result && result.filter !== 'global' && votes.length > 0) {
        // Best case: We have votes, take labels from the first vote (Snapshot of reality)
        const first = votes[0];
        if (result.filter === 'lv2') {
            regionLabel = first.region_lv2 || first.region_std_lv2 || 'Unknown';
            regionStd = first.region_std_lv2 || 'Unknown';
        } else if (result.filter === 'lv1') {
            regionLabel = first.region_lv1 || first.region_std_lv1 || 'Unknown';
            regionStd = first.region_std_lv1 || 'Unknown';
        } else if (result.filter === 'lv0') {
            regionLabel = first.region_lv0 || first.region_std_lv0 || 'Unknown';
            regionStd = first.region_std_lv0 || 'Unknown';
        }
    } else if (result && result.filter !== 'global') {
        // Fallback: No votes found, but we searched for a specific region context.
        // Use the input context to form labels if possible.
        if (result.filter === 'lv2') {
            regionLabel = context.region_lv2 || context.region_std_lv2 || 'Unknown';
            regionStd = context.region_std_lv2 || 'Unknown';
        } else if (result.filter === 'lv1') {
            regionLabel = context.region_lv1 || context.region_std_lv1 || 'Unknown';
            regionStd = context.region_std_lv1 || 'Unknown';
        } else if (result.filter === 'lv0') {
            regionLabel = context.region_lv0 || context.region_std_lv0 || 'Unknown';
            regionStd = context.region_std_lv0 || 'Unknown';
        }
    }

    return {
        score,
        total,
        region: regionLabel,
        region_std: regionStd,
        male: { score: maleScore, total: maleTotal },
        female: { score: femaleScore, total: femaleTotal }
    };
}
