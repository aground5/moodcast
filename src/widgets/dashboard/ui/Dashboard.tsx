"use client";

import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { analyzeMood } from '../lib/analyze';
import { MoodMap } from './MoodMap';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { FadeIn } from '@/shared/ui/MotionWrapper';
import { useMemo } from 'react';

export function Dashboard() {
    const { gender, mood, reset } = useVoteStore();
    const region = "마포구"; // Mock

    const analysis = useMemo(() => {
        if (!gender || !mood) return "데이터를 분석할 수 없습니다.";
        return analyzeMood(gender, mood, region);
    }, [gender, mood]);

    const moodColor = mood === 'good' ? 'text-blue-500' : 'text-gray-500';

    return (
        <div className="w-full max-w-md flex flex-col gap-6 p-4">
            <FadeIn>
                <Card className="bg-white/80 backdrop-blur-md border-white/50 shadow-xl">
                    <div className="flex flex-col gap-4 text-center">
                        <div className="text-6xl mb-2">
                            {mood === 'good' ? '☀️' : '☁️'}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            오늘의 <span className={moodColor}>기분 예보</span>
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed font-medium break-keep">
                            "{analysis}"
                        </p>
                    </div>
                </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
                <MoodMap />
            </FadeIn>


        </div>
    );
}
