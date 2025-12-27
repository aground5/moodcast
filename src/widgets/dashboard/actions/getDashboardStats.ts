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

export async function getDashboardStats(region_lv2?: string): Promise<DashboardStats> {
    const supabase = createAdminClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = supabase
        .from('mood_votes')
        .select('mood, gender')
        .gte('created_at', today.toISOString());

    if (region_lv2) {
        query = query.eq('region_lv2', region_lv2);
    } // else National

    const { data: votes, error } = await query;

    if (error || !votes || votes.length === 0) {
        return {
            score: 0,
            total: 0,
            region: region_lv2 || '전국',
            male: { score: 0, total: 0 },
            female: { score: 0, total: 0 }
        };
    }

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
        region: region_lv2 || '전국',
        male: {
            score: maleScore,
            total: maleTotal
        },
        female: {
            score: femaleScore,
            total: femaleTotal
        }
    };
}
