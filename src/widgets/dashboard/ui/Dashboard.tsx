"use client";

import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { MoodMap } from './MoodMap';
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

    return (
        <div className="w-full max-w-md flex flex-col gap-6 p-4">
            <FadeIn>
                <Card className="bg-white/80 backdrop-blur-md border-white/50 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col gap-4 text-center z-10 relative">
                        <ScaleIn>
                            <div className="text-6xl mb-2 filter drop-shadow-md">
                                {mood === 'good' ? '☀️' : '☁️'}
                            </div>
                        </ScaleIn>

                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {t.rich('title', {
                                    region: regionName,
                                    span: (chunks) => <span className={scoreColor}>{chunks}</span>,
                                    highlight: (chunks) => <span className={scoreColor}>{chunks}</span>
                                })}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
                                <span>{t('participants', { count: totalVotes.toLocaleString() })}</span>
                                <span>•</span>
                                <span>{t('happiness_index')} <span className={`text-lg font-bold ${scoreColor}`}>{happinessScore}%</span></span>
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-100 my-1" />

                        <p className="text-lg text-gray-700 leading-relaxed font-medium break-keep animate-fade-in-up">
                            {analysis}
                        </p>
                    </div>

                    {/* Background Decor */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${mood === 'good' ? 'bg-blue-400' : 'bg-gray-400'}`} />
                    <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${mood === 'good' ? 'bg-yellow-400' : 'bg-blue-900'}`} />
                </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
                <MoodMap />
            </FadeIn>

            <FadeIn delay={0.4}>
                <p className="text-center text-xs text-gray-400">
                    {t('reset_notice')}
                </p>
            </FadeIn>
        </div>
    );
}
