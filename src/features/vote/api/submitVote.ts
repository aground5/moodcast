import { submitVoteAction } from '../actions/submitVoteAction';

export async function submitVote(
    gender: 'male' | 'female',
    mood: 'good' | 'bad',
    coords?: { lat: number; lng: number },
    location?: {
        lv0?: string | null; lv1?: string | null; lv2?: string | null;
        std_lv0?: string | null; std_lv1?: string | null; std_lv2?: string | null;
    }
) {
    // Call Server Action
    const result = await submitVoteAction(gender, mood, coords, location);

    if (!result.success) {
        console.error('Vote submission error:', result.error);
        throw new Error(result.error || 'Failed to submit vote');
    }

    return result;
}
