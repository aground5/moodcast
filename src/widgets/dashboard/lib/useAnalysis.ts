import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { DashboardStats } from '../actions/getDashboardStats';
import { analyzeScenario } from './AnalysisEngine';

type Gender = 'male' | 'female';
type Mood = 'good' | 'bad';

export function useAnalysis(gender: Gender | null, mood: Mood | null, stats: DashboardStats | null) {
    const tDefault = useTranslations('analysis');

    return useMemo(() => {
        if (!gender || !mood || !stats) return tDefault('error');

        // Use the Dynamic Engine
        return analyzeScenario(gender, mood, stats);

    }, [gender, mood, stats, tDefault]);
}
