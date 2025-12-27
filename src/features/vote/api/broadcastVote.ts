import { createAdminClient } from '@/shared/lib/supabase/admin';
import { getDashboardStats } from '@/widgets/dashboard/actions/getDashboardStats';

export async function broadcastVote(region_lv2?: string) {
    const supabase = createAdminClient();

    // 1. Calculate Stats for the specific region
    if (region_lv2) {
        const regionStats = await getDashboardStats(region_lv2);

        // Broadcast to "mood-updates:region_name"
        // Note: Channel names must be safe string. Maybe URI encode if needed.
        await supabase.channel(`mood-updates:${region_lv2}`)
            .send({
                type: 'broadcast',
                event: 'stats-update',
                payload: regionStats
            });
    }

    // 2. Calculate National Stats
    const nationalStats = await getDashboardStats(); // No arg = National

    // Broadcast to "mood-updates:total" or "mood-updates:National"
    await supabase.channel('mood-updates:National')
        .send({
            type: 'broadcast',
            event: 'stats-update',
            payload: nationalStats
        });
}
