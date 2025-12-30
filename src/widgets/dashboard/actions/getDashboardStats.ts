'use server';

import { createAdminClient } from '@/shared/lib/supabase/admin';

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

import { getStartOfDayUTC } from '@/shared/lib/date/timezone';

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
    // value = Localized (for display preference) - NOT USED FOR QUERYING ANYMORE
    // valueStd = Standard (for query preference)
    const fetchStats = async (filter: 'lv2' | 'lv1' | 'lv0' | 'global', value?: string, valueStd?: string) => {
        let query = supabase
            .from('mood_votes')
            .select('mood, gender, region_lv2, region_lv1, region_lv0, region_std_lv2, region_std_lv1, region_std_lv0')
            .gte('created_at', startOfTodayUTC);

        // Security Update: Only query by region_std fields using strict equality (.eq)
        // This prevents query injection risks associated with .or() and string interpolation
        // and aligns with the requirement that all lookups will be based on standardized names.
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
            // If filter is requested but no valueStd provided, strictly return null.
            // We no longer support querying by localized name (e.g. region_lv2.eq.강남구)
            return null;
        }

        const { data, error } = await query;
        if (error || !data) return null;
        return { data, filter, value, valueStd };
    };

    // Strict priority check
    const isValid = (val?: string) => val && val !== 'Unknown' && val.trim() !== '';

    let result = null;

    // Waterfall Fallback Logic (Lv2 -> Lv1 -> Lv0 -> Global)
    // If strict lookup fails, we try the parent level.

    // 1. Try Lv2 (District)
    if (!result && context.region_std_lv2) {
        const res = await fetchStats('lv2', undefined, context.region_std_lv2);
        if (res && res.data.length > 0) result = res;
    }

    // 2. Try Lv1 (City) - Fallback from Lv2 or Direct Request
    if (!result && (context.region_std_lv1 || context.region_std_lv2)) {
        // If we strictly have lv1 input, use it.
        // If not, but we have lv2 input (which failed above), try reusing it as lv1.
        // This supports "Generic ID" usage where we don't know the level.
        const target = context.region_std_lv1 || context.region_std_lv2;
        if (target) {
            const res = await fetchStats('lv1', undefined, target);
            if (res && res.data.length > 0) result = res;
        }
    }

    // 3. Try Lv0 (Country)
    if (!result && (context.region_std_lv0 || context.region_std_lv2 || context.region_std_lv1)) {
        // Same logic: Try using any available standard ID as a country code if previous lookups failed.
        const target = context.region_std_lv0 || context.region_std_lv2 || context.region_std_lv1;
        if (target) {
            const res = await fetchStats('lv0', undefined, target);
            if (res && res.data.length > 0) result = res;
        }
    }

    // 4. Global Fallback
    if (!result) {
        result = await fetchStats('global');
    }

    const votes = result?.data || [];
    // Extract Standard Region Label (From DB or Input)
    let regionStd = 'Global';
    if (result?.valueStd) regionStd = result.valueStd;
    else if (votes.length > 0) {
        const first = votes[0];
        if (result?.filter === 'lv2') regionStd = first.region_std_lv2 || 'Global';
        else if (result?.filter === 'lv1') regionStd = first.region_std_lv1 || 'Global';
        else if (result?.filter === 'lv0') regionStd = first.region_std_lv0 || 'Global';
    }

    // Extract Localized Region Label (From DB or Input) - Priority for Display
    let regionLabel = 'Global';
    if (result?.value) regionLabel = result.value;
    else if (votes.length > 0 && result?.filter && result.filter !== 'global') {
        const first = votes[0];
        if (result.filter === 'lv2') regionLabel = first.region_lv2 || first.region_std_lv2 || 'Global';
        else if (result.filter === 'lv1') regionLabel = first.region_lv1 || first.region_std_lv1 || 'Global';
        else if (result.filter === 'lv0') regionLabel = first.region_lv0 || first.region_std_lv0 || 'Global';
    } else if (result?.valueStd) {
        regionLabel = result.valueStd;
    }

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

    return {
        score,
        total,
        region: regionLabel || '전국', // "Global" might be better localized? '전국' is "Nationwide". '전세계' is World.
        region_std: regionStd,
        male: { score: maleScore, total: maleTotal },
        female: { score: femaleScore, total: femaleTotal }
    };
}
