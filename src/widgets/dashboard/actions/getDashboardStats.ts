'use server';

import { createAdminClient } from '@/shared/lib/supabase/admin';

export interface DashboardStats {
    score: number;
    total: number;
    region: string;
}

export async function getDashboardStats(region_lv2?: string): Promise<DashboardStats> {
    const supabase = createAdminClient();

    // Get start of today (local time logic approximation: UTC for now to be safe, or just last 24h?)
    // The requirement specified "Calendar Day".
    // For simplicity in this MVP, we'll strip time from the current server date.
    // Ideally we'd handle timezone, but let's assume server time or UTC is acceptable consistency.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = supabase
        .from('mood_votes')
        .select('mood')
        .gte('created_at', today.toISOString());

    if (region_lv2) {
        query = query.eq('region_lv2', region_lv2);
    } else {
        // If no specific region, maybe we allow global stats?
        // Or if region_lv2 is undefined, we return "전국" stats.
    }

    const { data: votes, error } = await query;

    if (error || !votes || votes.length === 0) {
        console.error('Error fetching stats:', error);
        // Fallback or empty return
        return {
            score: 0,
            total: 0,
            region: region_lv2 || '전국'
        };
    }

    const total = votes.length;
    const good = votes.filter(v => v.mood === 'good').length;
    const score = Math.round((good / total) * 100);

    return {
        score,
        total,
        region: region_lv2 || '전국'
    };
}
