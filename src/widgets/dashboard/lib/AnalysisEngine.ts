import { ANALYSIS_MENT_DB, ScenarioType } from '@/i18n/contents/analysis_ko';
import { DashboardStats } from '../actions/getDashboardStats';

type Gender = 'male' | 'female';
type Mood = 'good' | 'bad';

/**
 * The "Meaning-Making" Engine.
 * Analyzes the user's state against the region's stats to determine the most narrative-relevant scenario.
 */
export function analyzeScenario(gender: Gender, mood: Mood, stats: DashboardStats): string {
    const { score: totalScore, male, female, region } = stats;

    let scenario: ScenarioType = 'all_good'; // Fallback

    const maleScore = male.score;
    const femaleScore = female.score;
    const gap = Math.abs(maleScore - femaleScore);

    // --- 1. Outlier Detection (Me vs The World) ---
    // Priority: Being alone in your mood is a strong narrative.

    // Alone Good: I am Good, World/Peers are Bad
    if (mood === 'good' && totalScore < 40) {
        scenario = 'alone_good';
    }
    // Alone Bad: I am Bad, World is Good
    else if (mood === 'bad' && totalScore > 60) {
        scenario = 'alone_bad';
    }

    // --- 2. Consensus Detection (Extreme Shared Mood) ---
    // All Bad: Everyone is miserable (Score < 30) OR (I am Bad + Score < 40)
    else if (totalScore < 30 || (mood === 'bad' && totalScore < 40)) {
        scenario = 'all_bad';
    }
    // All Good: Everyone is happy (Score > 70) OR (I am Good + Score > 60)
    else if (totalScore > 70 || (mood === 'good' && totalScore > 60)) {
        scenario = 'all_good';
    }

    // --- 3. Gender Contrast (Men vs Women) ---
    // Significant gap (>20%) implies a gender divide story.
    else if (gap > 20) {
        scenario = 'gender_contrast';
    }

    // --- 4. Fallback based on Mood ---
    else {
        if (mood === 'good') scenario = 'all_good';
        else scenario = 'all_bad';
    }

    // --- Select Message ---
    // 10% chance to inject a "Nudge" (Meta-commentary) if not an extreme outlier
    if (Math.random() < 0.1 && scenario !== 'alone_good' && scenario !== 'alone_bad') {
        scenario = 'nudge';
    }

    const messages = ANALYSIS_MENT_DB[scenario];
    const randomIndex = Math.floor(Math.random() * messages.length);
    // Explicitly type as string because ANALYSIS_MENT_DB is 'as const' and infers literal types
    let message: string = messages[randomIndex];

    // --- Interpolation ---
    // Replace {region} placeholder
    // Replace Gender-specific context if needed (e.g. "내가 여자라면")
    // Note: The provided texts have some hardcoded gender assumptions like "(내가 여자라면)".
    // We should clean that up or handle it.
    // Ideally, the DB shouldn't have conditional text inside strings, but for now we'll do simple cleaning.

    message = message.replace('{region}', region);

    // Handle the specific gender conditional strings in 'gender_contrast'
    // "(내가 여자라면)" messages should only be shown to females.
    // "(내가 남자라면)" messages should only be shown to males.
    // If we picked a message that doesn't match our gender, pick again or clean it.
    // Actually, let's filter the array BEFORE picking if we are in gender_contrast.

    if (scenario === 'gender_contrast') {
        // Refetch to specific filtering logic
        const validMessages = messages.filter(msg => {
            if (gender === 'female' && msg.includes('(내가 남자라면)')) return false;
            if (gender === 'male' && msg.includes('(내가 여자라면)')) return false;
            return true;
        });
        const validIndex = Math.floor(Math.random() * validMessages.length);
        message = validMessages[validIndex];

        // Clean the prefix tags
        message = message.replace('(내가 여자라면)', '').replace('(내가 남자라면)', '').trim();
    }

    return message;
}
