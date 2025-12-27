"use client";

import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { analyzeMood } from '../lib/analyze';
import { MoodMap } from './MoodMap';
import { Card } from '@/shared/ui/Card';
import { FadeIn, ScaleIn } from '@/shared/ui/MotionWrapper';
import { useMemo, useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats } from '../actions/getDashboardStats';

export function Dashboard() {
    const { gender, mood, region } = useVoteStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Fetch Stats on Mount
    useEffect(() => {
        const fetchStats = async () => {
            // Use region from store if available (hydrated from DB)
            // If user just voted, they might not have region string in store unless we set it.
            // But wait, submitVoteAction returns nothing. 
            // If they just voted, hasVoted=true -> page reload -> hydration -> region set.
            // If they are in the SPA flow (just clicked vote), we don't reload page.
            // So store.region might still be null IF we didn't set it upon voting.

            // To be safe: pass `region || undefined`. 
            // If null, it will fetch national stats.
            const data = await getDashboardStats(region || undefined);
            setStats(data);
        };
        fetchStats();
    }, [region]);

    const regionName = stats?.region || "전국";
    const happinessScore = stats?.score || 0;
    const totalVotes = stats?.total || 0;

    const analysis = useMemo(() => {
        if (!gender || !mood) return "데이터를 분석할 수 없습니다.";
        return analyzeMood(gender, mood, regionName);
    }, [gender, mood, regionName]);

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
                                {regionName}의 <span className={scoreColor}>기분 날씨</span>
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
                                <span>참여자 {totalVotes.toLocaleString()}명</span>
                                <span>•</span>
                                <span>행복지수 <span className={`text-lg font-bold ${scoreColor}`}>{happinessScore}%</span></span>
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-100 my-1" />

                        <p className="text-lg text-gray-700 leading-relaxed font-medium break-keep animate-fade-in-up">
                            "{analysis}"
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
                    *집계 데이터는 매일 자정에 초기화됩니다.
                </p>
            </FadeIn>
        </div>
    );
}
