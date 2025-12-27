import HomePage from '@/views/home/HomePage';
import { cookies } from 'next/headers';

import { createAdminClient } from '@/shared/lib/supabase/admin';

export default async function Page() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('moodcast_uid')?.value;

    let hasVoted = false;

    // 1. Optimization: Check Cookie Timestamp first
    const lastVotedAt = cookieStore.get('moodcast_last_voted_at')?.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastVotedAt) {
        const lastVotedDate = new Date(lastVotedAt);
        if (lastVotedDate >= today) {
            hasVoted = true;
        }
    }

    // 2. Fallback: If cookie check didn't confirm vote (or cookie missing), check DB
    if (!hasVoted && userId) {
        const supabase = createAdminClient();

        const { data } = await supabase
            .from('mood_votes')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', today.toISOString())
            .limit(1)
            .single();

        if (data) hasVoted = true;
    }

    const savedGender = cookieStore.get('moodcast_gender')?.value as 'male' | 'female' | undefined;
    const initialStep = hasVoted ? 'result' : 'gender';

    return <HomePage initialStep={initialStep} savedGender={savedGender} />;
}
