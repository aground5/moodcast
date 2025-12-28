import { ANALYSIS_MENT_DB as DB_KO, ScenarioType } from '@/i18n/contents/analysis_ko';
import { ANALYSIS_MENT_DB_EN } from '@/i18n/contents/analysis_en';
import { ANALYSIS_MENT_DB_JA } from '@/i18n/contents/analysis_ja';
import { ANALYSIS_MENT_DB_ZH } from '@/i18n/contents/analysis_zh';
import { ANALYSIS_MENT_DB_DE } from '@/i18n/contents/analysis_de';
import { ANALYSIS_MENT_DB_FR } from '@/i18n/contents/analysis_fr';
import { ANALYSIS_MENT_DB_ES } from '@/i18n/contents/analysis_es';
import { ANALYSIS_MENT_DB_PT } from '@/i18n/contents/analysis_pt';
import { ANALYSIS_MENT_DB_RU } from '@/i18n/contents/analysis_ru';

import { DashboardStats } from '../actions/getDashboardStats';

type Gender = 'male' | 'female';
type Mood = 'good' | 'bad';

const DB_MAP: Record<string, any> = {
    ko: DB_KO,
    en: ANALYSIS_MENT_DB_EN,
    ja: ANALYSIS_MENT_DB_JA,
    zh: ANALYSIS_MENT_DB_ZH,
    de: ANALYSIS_MENT_DB_DE,
    fr: ANALYSIS_MENT_DB_FR,
    es: ANALYSIS_MENT_DB_ES,
    pt: ANALYSIS_MENT_DB_PT,
    ru: ANALYSIS_MENT_DB_RU,
};

/**
 * The "Relational Meaning" Engine.
 * Analyzes the user's state relative to Other Gender, Peer Group, and the World.
 */
export function analyzeScenario(
    gender: Gender,
    mood: Mood,
    stats: DashboardStats,
    locale: string = 'ko',
    t: (key: string) => string,
    displayRegion?: string // Explicit override for {region} placeholder
): string {
    const { score: totalScore, male, female, region } = stats;
    // Use displayRegion if provided, otherwise fallback to stats.region
    const targetRegion = displayRegion || region;

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

    const db = DB_MAP[locale] || DB_MAP['en']; // Fallback to EN if locale missing
    const messages: readonly string[] = db[scenario];

    // Safety check in case DB is missing key or empty
    if (!messages || messages.length === 0) {
        return t('analysis.analyzing_data') || "Analyzing data..."; // Fallback key
    }

    const randomIndex = Math.floor(Math.random() * messages.length);
    // Explicitly type as string to match return type
    let message: string = messages[randomIndex];

    // --- Interpolation ---
    const isMale = gender === 'male';

    // Use translator for gender terms
    const myGenderTerm = isMale ? t('vote.gender.male') : t('vote.gender.female');
    const otherGenderTerm = isMale ? t('vote.gender.female') : t('vote.gender.male');

    const myScoreInt = Math.round(isMale ? male.score : female.score);
    const otherScoreInt = Math.round(isMale ? female.score : male.score);

    message = message
        .replace(/{region}/g, targetRegion)
        .replace(/{gender}/g, myGenderTerm)
        .replace(/{otherGender}/g, otherGenderTerm)
        .replace(/{myScore}/g, myScoreInt.toString())
        .replace(/{otherScore}/g, otherScoreInt.toString());

    return message;
}
