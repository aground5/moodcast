import { submitVoteAction } from '../actions/submitVoteAction';

export async function submitVote(
    gender: 'male' | 'female',
    mood: 'good' | 'bad',
    coords?: { lat: number; lng: number }
) {
    // Call Server Action
    const result = await submitVoteAction(gender, mood, coords);

    if (!result.success) {
        console.error('Vote submission error:', result.error);
        throw new Error(result.error || 'Failed to submit vote');
    }
}
