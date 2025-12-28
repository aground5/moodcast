import { createAdminClient } from '@/shared/lib/supabase/admin';
import { getDashboardStats } from '@/widgets/dashboard/actions/getDashboardStats';

export interface BroadcastContext {
    region_lv2?: string;
    region_lv1?: string;
    region_lv0?: string;
}

export async function broadcastVote(context: BroadcastContext, timezone: string = 'Asia/Seoul') {
    const supabase = createAdminClient();

    // Helper to fetch and broadcast
    const sendUpdate = async (channelSuffix: string, queryContext: BroadcastContext) => {
        // We fetch stats specifically for this target context
        // getDashboardStats has a waterfall, but if we provide ONLY region_lv1, it will fetch Lv1.
        // This is why ensuring getDashboardStats respects the "most specific provided" is key.
        const stats = await getDashboardStats(queryContext, timezone);

        // Safety: If the stats returned are empty (total=0), we still broadcast (it will show 100% happy).

        await supabase.channel(`mood-updates:${channelSuffix}`)
            .send({
                type: 'broadcast',
                event: 'stats-update',
                payload: stats
            });
    };

    const tasks = [];

    // 1. Lv2 (District)
    if (context.region_lv2 && context.region_lv2 !== 'Unknown') {
        tasks.push(sendUpdate(context.region_lv2, { region_lv2: context.region_lv2 }));
    }

    // 2. Lv1 (City)
    if (context.region_lv1 && context.region_lv1 !== 'Unknown') {
        tasks.push(sendUpdate(context.region_lv1, { region_lv1: context.region_lv1 }));
    }

    // 3. Lv0 (Country)
    if (context.region_lv0 && context.region_lv0 !== 'Unknown') {
        tasks.push(sendUpdate(context.region_lv0, { region_lv0: context.region_lv0 }));
    }

    // 4. Global (Fallback for those viewing "Global")
    // If we want "Global", we should broadcast to "Global".
    // Dashboard.tsx defaults to `mood-updates:Global` if no region is present.
    // So we broadcast to "Global".
    tasks.push(sendUpdate('Global', {})); // Empty context = Global fetch in getDashboardStats

    await Promise.all(tasks);
}
