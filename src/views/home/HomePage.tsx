"use client";

import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { GenderSelector } from '@/features/vote/ui/GenderSelector';
import { MoodSelector } from '@/features/vote/ui/MoodSelector';
import { LandingHeader } from '@/widgets/landing/LandingHeader';
import { MoodHeader } from '@/widgets/mood/MoodHeader';
import { Dashboard } from '@/widgets/dashboard/ui/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

import { getLocationDisplayName } from '@/shared/lib/location/display';

interface HomePageProps {
    initialStep: 'gender' | 'result';
    savedGender?: 'male' | 'female';
    initialVote?: any;
    initialLv0?: string; // region0 (Local) "대한민국"
    initialStdLv0?: string; // region0 (Std) "South Korea"
    initialAnalysis?: string;
    initialStats?: any; // DashboardStats
}


import { useTranslations, useLocale } from 'next-intl';

export default function HomePage({ initialStep, savedGender, initialVote, initialLv0, initialStdLv0, initialAnalysis, initialStats }: HomePageProps) {
    const t = useTranslations('dashboard'); // Assuming we need translations? Or just for locale.
    const locale = useLocale();
    const { step, setStep, setGender, setMood, setRegion, setCoords } = useVoteStore();

    useEffect(() => {
        // ... (Server Data Priority)
        if (initialVote) {
            setGender(initialVote.gender);
            setMood(initialVote.mood);
            setRegion({
                lv0: initialVote.region_lv0,
                lv1: initialVote.region_lv1,
                lv2: initialVote.region_lv2,
                std_lv0: initialVote.region_std_lv0,
                std_lv1: initialVote.region_std_lv1,
                std_lv2: initialVote.region_std_lv2
            });
        }
        else {
            if (savedGender) setGender(savedGender);
            if (initialLv0) setRegion({
                lv0: initialLv0,
                lv1: 'Unknown',
                lv2: 'Unknown',
                std_lv0: initialStdLv0,
                std_lv1: 'Unknown',
                std_lv2: 'Unknown'
            });

            // Refine with Server Action (Full localization)
            // Call detectLocationFromHeaders with skipLocalization: false for full details
            import('@/shared/lib/location/server').then(({ detectLocationFromHeaders }) => {
                detectLocationFromHeaders(locale, { skipLocalization: false })
                    .then((refined) => {
                        if (refined && refined.region1 !== 'Unknown') {
                            setRegion({
                                lv0: refined.region0,
                                lv1: refined.region1,
                                lv2: refined.region2,
                                std_lv0: refined.std?.region0 || 'Unknown',
                                std_lv1: refined.std?.region1 || 'Unknown',
                                std_lv2: refined.std?.region2 || 'Unknown',
                            });
                        }
                    })
                    .catch((e) => console.error('Header Refinement Failed:', e));
            });
        }

        if (initialStep === 'result') {
            setStep('result');
        }

        // 3. Dynamic GPS Support (watchPosition + Permission Listener)
        let watchId: number | null = null;
        let permissionStatus: PermissionStatus | null = null;

        const startWatching = () => {
            if ('geolocation' in navigator) {
                // Clear existing watch if any to avoid duplicates
                if (watchId !== null) navigator.geolocation.clearWatch(watchId);

                watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;

                        setCoords({ lat, lng });

                        if (!initialVote) {
                            const { detectLocationFromGPS } = await import('@/shared/lib/location/index');
                            const location = await detectLocationFromGPS(lat, lng, locale);

                            console.log(location)

                            if (location) {
                                setRegion({
                                    lv0: location.region0,
                                    lv1: location.region1,
                                    lv2: location.region2,
                                    std_lv0: location.std?.region0,
                                    std_lv1: location.std?.region1,
                                    std_lv2: location.std?.region2
                                });
                            }
                        }
                    },
                    (error) => {
                        console.log('Location watch error:', error);
                    },
                    { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
                );
            }
        };

        // Initialize watch
        startWatching();

        // Listen for Permission Changes (Denied -> Granted)
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'geolocation' }).then((status) => {
                permissionStatus = status;
                status.onchange = () => {
                    console.log('Permission changed:', status.state);
                    if (status.state === 'granted') {
                        startWatching();
                    }
                };
            });
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            if (permissionStatus) permissionStatus.onchange = null;
        };
    }, [initialStep, savedGender, initialVote, initialLv0, setStep, setGender, setMood, setRegion, setCoords, locale]);


    const isReturningUser = !!savedGender;

    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
            <AnimatePresence mode="wait">
                {step === 'gender' && (
                    <motion.div
                        key="gender"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center w-full"
                    >
                        <LandingHeader isReturningUser={isReturningUser} initialRegion={initialLv0} />
                        <GenderSelector />
                    </motion.div>
                )}

                {step === 'mood' && (
                    <motion.div
                        key="mood"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center w-full"
                    >
                        {/* ... We need to verify imports for LandingHeader/GenderSelector/MoodSelector if I replace whole file ... */}
                        {/* Careful replacing huge blocks. I'll target specific blocks. */}
                        {/* Show MoodHeader only if the user is returning (started at this step). New users should focus on the question. */}
                        {isReturningUser && <MoodHeader initialRegion={initialLv0} />}
                        <MoodSelector />
                    </motion.div>
                )}

                {step === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-sm"
                    >
                        <Dashboard initialAnalysis={initialAnalysis} initialStats={initialStats} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
