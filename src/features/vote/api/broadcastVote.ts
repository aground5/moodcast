import { createAdminClient } from '@/shared/lib/supabase/admin';
import { getDashboardStats } from '@/widgets/dashboard/actions/getDashboardStats';

export interface BroadcastContext {
    region_std_lv2?: string;
    region_std_lv1?: string;
    region_std_lv0?: string;
}

export async function broadcastVote(context: BroadcastContext, timezone: string = 'Asia/Seoul') {
    const supabase = createAdminClient();

    // Helper to fetch and broadcast
    const sendUpdate = async (channelSuffix: string, queryContext: any) => { // queryContext matches getDashboardStats expected input
        // We fetch stats specifically for this target context
        // Using Standard Keys triggers the efficient .eq() query in getDashboardStats
        const stats = await getDashboardStats(queryContext, timezone);

        // Remove localized 'region' from payload (User Request) to prevent 
        // overwriting client's display name with the sender's localized (or standard) name.
        // The client relies on its own localized region state for the title.
        const { region, ...payload } = stats;

        // Safety: If the stats returned are empty (total=0), we still broadcast (it will show 100% happy).

        await supabase.channel(`mood-updates:${channelSuffix}`)
            .send({
                type: 'broadcast',
                event: 'stats-update',
                payload
            });
    };

    const tasks = [];

    // 1. Lv2 (District)
    if (context.region_std_lv2 && context.region_std_lv2 !== 'Unknown') {
        tasks.push(sendUpdate(context.region_std_lv2, { region_std_lv2: context.region_std_lv2 }));
    }

    // 2. Lv1 (City)
    if (context.region_std_lv1 && context.region_std_lv1 !== 'Unknown') {
        tasks.push(sendUpdate(context.region_std_lv1, { region_std_lv1: context.region_std_lv1 }));
    }

    // 3. Lv0 (Country)
    if (context.region_std_lv0 && context.region_std_lv0 !== 'Unknown') {
        tasks.push(sendUpdate(context.region_std_lv0, { region_std_lv0: context.region_std_lv0 }));
    }

    // 4. Global (Fallback for those viewing "Global")
    // If we want "Global", we should broadcast to "Global".
    // Dashboard.tsx defaults to `mood-updates:Global` if no region is present.
    // So we broadcast to "Global".
    tasks.push(sendUpdate('Global', {})); // Empty context = Global fetch in getDashboardStats

    await Promise.all(tasks);
}
