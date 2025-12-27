"use client";

import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { Card } from '@/shared/ui/Card';
import { FadeIn, ScaleIn } from '@/shared/ui/MotionWrapper';
import { useMemo, useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats } from '../actions/getDashboardStats';
import { useTranslations } from 'next-intl';
import { useAnalysis } from '../lib/useAnalysis';
import { createClient } from '@/shared/lib/supabase/client';

export function Dashboard() {
    const t = useTranslations('dashboard');
    const { gender, mood, region } = useVoteStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Fetch Stats on Mount & Subscribe to Realtime
    useEffect(() => {
        const fetchStats = async () => {
            const data = await getDashboardStats(region || undefined);
            setStats(data);
        };
        fetchStats();

        // Realtime Subscription
        const supabase = createClient();
        const channelName = region ? `mood-updates:${region}` : `mood-updates:National`;

        const channel = supabase.channel(channelName)
            .on('broadcast', { event: 'stats-update' }, (payload) => {
                console.log('Realtime Update:', payload);
                if (payload.payload) {
                    setStats(payload.payload as DashboardStats);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [region]);

    const regionName = stats?.region || "전국";
    const happinessScore = stats?.score || 0;
    const totalVotes = stats?.total || 0;

    const analysis = useAnalysis(gender, mood, stats);

    const moodColor = mood === 'good' ? 'text-blue-500' : 'text-gray-500';
    const scoreColor = happinessScore >= 50 ? 'text-blue-600' : 'text-gray-600';
    const moodLabel = mood === 'good' ? t('my_mood_good') : t('my_mood_bad');
    const moodIcon = mood === 'good' ? '☀️' : '☁️';

    return (
        <div className="w-full max-w-sm flex flex-col gap-6 p-4 items-center">

            {/* Section 1: My Mood (Input Confirmation) */}
            <FadeIn>
                <div className="flex flex-col items-center gap-2">
                    <ScaleIn>
                        <div className="text-6xl filter drop-shadow-md animate-float-slow">
                            {moodIcon}
                        </div>
                    </ScaleIn>
                    <p className="text-gray-600 font-medium text-lg">
                        {t('my_mood_prefix')}
                        <span className={`font-bold ${mood === 'good' ? 'text-blue-500' : 'text-gray-500'}`}>
                            {moodLabel}
                        </span>
                        {t('my_mood_suffix')}
                    </p>
                </div>
            </FadeIn>

            {/* Section 2: The Bridge (Relational Message) */}
            <FadeIn delay={0.2} className="w-full">
                <div className="relative py-4 text-center">
                    <span className="absolute top-0 left-2 text-4xl text-gray-200 font-serif">“</span>
                    <p className="text-xl md:text-2xl text-gray-800 font-bold leading-relaxed break-keep px-4 font-serif">
                        {analysis}
                    </p>
                    <span className="absolute bottom-0 right-2 text-4xl text-gray-200 font-serif">”</span>
                </div>
            </FadeIn>

            {/* Section 3: Regional Vibe (Output Stats) */}
            <FadeIn delay={0.4} className="w-full">
                <Card className="bg-white/40 backdrop-blur-md border border-white/60 shadow-lg p-5">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                            <span className="font-semibold text-gray-700 flex items-center gap-1">
                                📍 {t('region_report_title', { region: regionName })}
                            </span>
                        </div>

                        <div className="flex justify-around items-center pt-1">
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-500 mb-1">{t('happiness_index')}</span>
                                <span className={`text-2xl font-bold ${scoreColor}`}>
                                    {happinessScore}%
                                </span>
                            </div>
                            <div className="w-px h-8 bg-gray-300/50" />
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-500 mb-1">{t('participants')}</span>
                                <span className="text-2xl font-bold text-gray-700">
                                    {totalVotes.toLocaleString()}
                                    <span className="text-sm font-normal text-gray-500 ml-0.5">명</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </FadeIn>

            {/* Map Removed by User Request */}

            <FadeIn delay={0.8}>
                <p className="text-center text-xs text-gray-400">
                    {t('reset_notice')}
                </p>
            </FadeIn>
        </div>
    );
}
