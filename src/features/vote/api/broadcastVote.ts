import { createAdminClient } from '@/shared/lib/supabase/admin';
import { getDashboardStats } from '@/widgets/dashboard/actions/getDashboardStats';

export async function broadcastVote(region_lv2?: string, timezone: string = 'Asia/Seoul') {
    const supabase = createAdminClient();

    // 1. Calculate Stats for the specific region (using its timezone context)
    if (region_lv2) {
        const regionStats = await getDashboardStats({ region_lv2 }, timezone);

        // Broadcast to "mood-updates:region_name"
        await supabase.channel(`mood-updates:${region_lv2}`)
            .send({
                type: 'broadcast',
                event: 'stats-update',
                payload: regionStats
            });
    }

    // 2. Calculate National Stats (Global context?)
    // If the vote was in a timezone, usually "National" aggregates might be sensitive to that?
    // For now, let's use the voter's timezone to update the "National" view *for that timezone*? 
    // Or just default to Seoul for "Global/Korea" view.
    // Given the app is Korean-first but global-capable:
    const nationalStats = await getDashboardStats({}, timezone);

    // Broadcast to "mood-updates:National"
    await supabase.channel('mood-updates:National')
        .send({
            type: 'broadcast',
            event: 'stats-update',
            payload: nationalStats
        });
}
