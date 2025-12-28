import { useTranslations, useLocale } from 'next-intl';
import { useMemo, useState } from 'react';
import { DashboardStats } from '../actions/getDashboardStats';
import { analyzeScenario } from './AnalysisEngine';

type Gender = 'male' | 'female';
type Mood = 'good' | 'bad';

export function useAnalysis(gender: Gender | null, mood: Mood | null, stats: DashboardStats | null, initialAnalysis?: string) {
    const t = useTranslations(); // Get root translator to access 'vote' and 'analysis'
    const locale = useLocale();

    // Stable State: Initialize with SSR value if present
    const [stableMessage, setStableMessage] = useState<string | null>(initialAnalysis || null);

    // Only generate ONCE if not provided (Client-side fallback)
    useMemo(() => {
        // If we already have a message, don't change it.
        // This effectively "locks" the first valid analysis.
        if (stableMessage) return;

        if (!gender || !mood || !stats) {
            // Not ready yet
            return;
        }

        const message = analyzeScenario(gender, mood, stats, locale, t);
        setStableMessage(message);

    }, [gender, mood, stats, stableMessage, locale, t]);

    return stableMessage || t('analysis.error');
}
