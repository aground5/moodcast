"use client";

import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { Card } from '@/shared/ui/Card';
import { FadeIn, ScaleIn } from '@/shared/ui/MotionWrapper';
import { useMemo, useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats } from '../actions/getDashboardStats';
import { useTranslations, useLocale } from 'next-intl';
import { useAnalysis } from '../lib/useAnalysis';
import { createClient } from '@/shared/lib/supabase/client';

import { AnimatePresence, motion } from 'framer-motion';
import { DataLab } from './DataLab';

export function Dashboard({ initialAnalysis, initialStats }: { initialAnalysis?: string, initialStats?: DashboardStats | null }) {
    const t = useTranslations('dashboard');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { gender, mood, region, region_std } = useVoteStore();

    // Typography Logic
    const isCJK = ['ja', 'zh'].includes(locale);
    const isKorean = locale === 'ko';

    const typographyClass = isCJK
        ? 'break-all leading-[1.6]' // JA, ZH: Break anywhere, relaxed line height
        : isKorean
            ? 'break-keep leading-relaxed' // KO: Keep words together, relaxed
            : 'break-words leading-tight'; // Western: Standard wrapping
    // Initialize with server data if available to prevent "Global" flash
    const [stats, setStats] = useState<DashboardStats | null>(initialStats || null);

    // Fetch Stats on Mount & Subscribe to Realtime
    useEffect(() => {
        const fetchStats = async () => {
            // Skip fetching if we already have initial stats (and region matches roughly or just trust it)
            // But if region changes (client-side), we must fetch.
            // Simple logic: If we have stats, skip. 
            // Wait, if user navigates or changes settings? Dashboard is only shown on Result step.
            if (initialStats && !region) return; // Use initial
            if (initialStats && stats === initialStats) return; // Already have it. 

            // Actually, simplest is: Only fetch if stats is null OR if region changed.
            // But region changes on hydration.

            // Optimization: fetch only if stats is null.
            if (stats) return;

            // Detect browser timezone for accurate "Start of Day"
            const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const data = await getDashboardStats(
                {
                    region_lv2: region || undefined,
                    region_lv1: region || undefined,
                    region_lv0: region || undefined
                },
                browserTimezone
            );
            setStats(data);
        };
        fetchStats();

        // Realtime Subscription
        const supabase = createClient();

        // Use Standard English Region for shared channel
        const activeStdRegion = region_std || initialStats?.region_std || 'Global';

        const channelName = `mood-updates:${activeStdRegion}`;

        const channel = supabase.channel(channelName)
            .on('broadcast', { event: 'stats-update' }, (event) => {
                const payload = event.payload as DashboardStats;
                console.log('Realtime Update:', payload);
                if (payload) {
                    setStats((prev) => {
                        // Preserve existing localized region name (User Request)
                        if (prev) {
                            return {
                                ...payload,
                                region: prev.region,
                                region_std: prev.region_std // Ensure consistency
                            };
                        }
                        return payload;
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [region, region_std, initialStats]);

    // Handle "Global" literal from server or missing region
    const rawRegion = stats?.region;
    const regionName = (rawRegion === 'Global' || !rawRegion)
        ? tCommon('world')
        : rawRegion;

    const happinessScore = stats?.score || 0;
    const totalVotes = stats?.total || 0;

    const analysis = useAnalysis(gender, mood, stats, initialAnalysis);

    const moodLabel = mood === 'good' ? t('my_mood_good') : t('my_mood_bad');
    const moodIcon = mood === 'good' ? '☀️' : '☁️';
    const scoreColor = happinessScore >= 50 ? 'text-blue-600' : 'text-gray-600';

    const [showDataLab, setShowDataLab] = useState(false);

    const handleShare = async () => {
        const text = t('share_text', { region: regionName });
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'MoodCast', text, url });
            } catch (err) {
                console.log('Share canceled', err);
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(`${text} ${url}`);
            alert(t('copy_success'));
        }
    };

    return (
        <div className="w-full max-w-sm flex flex-col gap-6 p-4 items-center relative">
            {/* Show DataLab Modal */}
            <AnimatePresence>
                {showDataLab && (
                    <DataLab stats={stats} onClose={() => setShowDataLab(false)} />
                )}
            </AnimatePresence>

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
                <div className="py-6 px-4 text-center relative flex flex-col items-center gap-4">
                    <span className="absolute top-0 left-2 text-3xl text-gray-200 font-serif leading-none">“</span>
                    <p className={`text-xl md:text-2xl text-gray-800 font-bold font-serif px-2 whitespace-pre-wrap ${typographyClass}`}>
                        {analysis}
                    </p>
                    <span className="absolute bottom-0 right-2 text-3xl text-gray-200 font-serif leading-none">”</span>
                </div>
            </FadeIn>


            {/* Section 3: Regional Vibe (Quiet Ticker) */}
            <FadeIn delay={0.6} className="w-full">
                <motion.div
                    layoutId="report-ticker"
                    onClick={() => setShowDataLab(true)}
                    className="cursor-pointer group flex flex-col items-center gap-1 active:opacity-70 transition-opacity"
                >
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-50/80 px-4 py-2 rounded-full border border-gray-100 shadow-sm backdrop-blur-sm">
                        <span>📍 {t('region_report_title', { region: regionName })}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className={scoreColor}>{happinessScore}%</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>{totalVotes.toLocaleString()}{t('participants_unit')}</span>

                        {/* Live Dot (Subtle) */}
                        <span className="relative flex h-1.5 w-1.5 ml-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </span>
                    </div>
                </motion.div>
            </FadeIn>

            {/* Share Button (Delayed Highlight) */}
            <FadeIn delay={0.8} className="w-full">
                <motion.button
                    onClick={handleShare}
                    initial={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }} // gray-100, gray-400
                    animate={{ backgroundColor: '#111827', color: '#ffffff' }} // gray-900, white
                    transition={{ delay: 2.5, duration: 1.0, ease: "easeInOut" }}
                    className="w-full py-3 font-bold rounded-xl shadow-lg hover:bg-gray-800 active:scale-95 flex items-center justify-center gap-2 transition-transform"
                >
                    <span>📤</span>
                    {t('share_button')}
                </motion.button>
            </FadeIn>

            <FadeIn delay={0.8}>
                <p className="text-center text-xs text-gray-400">
                    {t('reset_notice')}
                </p>
            </FadeIn>
        </div>
    );
}
