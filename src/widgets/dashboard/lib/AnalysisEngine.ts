import { ANALYSIS_MENT_DB, ScenarioType } from '@/i18n/contents/analysis_ko';
import { DashboardStats } from '../actions/getDashboardStats';

type Gender = 'male' | 'female';
type Mood = 'good' | 'bad';

/**
 * The "Relational Meaning" Engine.
 * Analyzes the user's state relative to Other Gender, Peer Group, and the World.
 */
export function analyzeScenario(gender: Gender, mood: Mood, stats: DashboardStats): string {
    const { score: totalScore, male, female, region } = stats;

    const myPeerScore = gender === 'male' ? male.score : female.score;
    const otherPeerScore = gender === 'male' ? female.score : male.score;

    let scenario: ScenarioType = 'world_utopia'; // Default fallback (optimistic)

    // --- 0. Meta Nudge (First Priority Check for Randomness) ---
    // 15% chance if mood is bad to verify if it's just "hangry"
    if (mood === 'bad' && Math.random() < 0.15) {
        scenario = 'bad_nudge';
    } else {
        // --- 1. Interaction (Me vs Other Gender) ---
        // "The Eye Contact Game" - High priority for social dynamics

        // Caution: I'm Good, They are exploding (<30)
        if (mood === 'good' && otherPeerScore < 30) {
            scenario = 'watch_out_other';
        }
        // Connection: I'm Bad, They are struggling too (<30)
        else if (mood === 'bad' && otherPeerScore < 30) {
            scenario = 'cheer_up_other';
        }
        // Opportunity: I'm Good, They are happy (>70)
        else if (mood === 'good' && otherPeerScore > 70) {
            scenario = 'chance_other';
        }
        // Jealousy: I'm Bad, They are partying (>70)
        else if (mood === 'bad' && otherPeerScore > 70) {
            scenario = 'envy_other';
        }

        // --- 2. World Concept (Extreme Isolation or Synergy) ---
        // Disaster: Total < 20 (Everyone dying)
        else if (mood === 'bad' && totalScore < 20) {
            scenario = 'world_disaster';
        }
        // Utopia: Total > 80 (Everyone flying)
        else if (mood === 'good' && totalScore > 80) {
            scenario = 'world_utopia';
        }
        // Outliers
        else if (mood === 'good' && totalScore < 40) {
            scenario = 'world_outlier_good';
        }
        else if (mood === 'bad' && totalScore > 60) {
            scenario = 'world_outlier_bad';
        }

        // --- 3. Peer Dynamics (Me vs My Group) ---
        // Black Sheep: I'm Bad, My group Good (>70)
        else if (mood === 'bad' && myPeerScore > 70) {
            scenario = 'peer_black_sheep';
        }
        // Solidarity: I'm Bad, My group Bad (<30)
        else if (mood === 'bad' && myPeerScore < 30) {
            scenario = 'peer_solidarity';
        }
        // Captain: I'm Good, My group Bad (<30)
        else if (mood === 'good' && myPeerScore < 30) {
            scenario = 'peer_captain';
        }
        // Harmony: I'm Good, My group Good (>70)
        else if (mood === 'good' && myPeerScore > 70) {
            scenario = 'peer_harmony';
        }

        // --- 4. Fallbacks (If no extreme conditions met) ---
        // Return to mid-range logic or generic relational
        else {
            // If nothing matches, default to world outlier logic with softer thresholds
            if (mood === 'good') scenario = 'world_outlier_good';
            else scenario = 'world_outlier_bad';
        }
    }

    const messages: readonly string[] = ANALYSIS_MENT_DB[scenario];
    // Safety check in case DB is missing key or empty
    if (!messages || messages.length === 0) {
        return "데이터 분석 중입니다...";
    }

    const randomIndex = Math.floor(Math.random() * messages.length);
    // Explicitly type as string to match return type
    let message: string = messages[randomIndex];

    // --- Interpolation ---
    const isMale = gender === 'male';
    const myGenderKR = isMale ? '남자' : '여자';
    const otherGenderKR = isMale ? '여자' : '남자';
    const myScoreInt = Math.round(isMale ? male.score : female.score);
    const otherScoreInt = Math.round(isMale ? female.score : male.score);

    message = message
        .replace(/{region}/g, region)
        .replace(/{gender}/g, myGenderKR)
        .replace(/{otherGender}/g, otherGenderKR)
        .replace(/{myScore}/g, myScoreInt.toString())
        .replace(/{otherScore}/g, otherScoreInt.toString());

    return message;
}
