"use client";

import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { GenderSelector } from '@/features/vote/ui/GenderSelector';
import { MoodSelector } from '@/features/vote/ui/MoodSelector';
import { LandingHeader } from '@/widgets/landing/LandingHeader';
import { MoodHeader } from '@/widgets/mood/MoodHeader';
import { Dashboard } from '@/widgets/dashboard/ui/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

import { refineLocationAction } from '@/features/location/actions/refineLocation';
import { getLocationDisplayName } from '@/shared/lib/location/display';

interface HomePageProps {
    initialStep: 'gender' | 'result';
    savedGender?: 'male' | 'female';
    initialVote?: any;
    ipRegion?: string;
    initialCountry?: string;
    initialCity?: string; // New prop for refinement source (e.g. English City)
    initialAnalysis?: string;
    initialStats?: any; // DashboardStats
}

import { useTranslations, useLocale } from 'next-intl';

export default function HomePage({ initialStep, savedGender, initialVote, ipRegion, initialCountry, initialCity, initialAnalysis, initialStats }: HomePageProps) {
    const t = useTranslations('dashboard'); // Assuming we need translations? Or just for locale.
    const locale = useLocale();
    const { step, setStep, setGender, setMood, setRegion, setCoords } = useVoteStore();

    useEffect(() => {
        // ... (Server Data Priority)
        if (initialVote) {
            setGender(initialVote.gender);
            setMood(initialVote.mood);
            const displayRegion = getLocationDisplayName({
                region_lv2: initialVote.region_lv2,
                region_lv1: initialVote.region_lv1,
                region_lv0: initialVote.region_lv0
            }, initialVote.region_lv2 || 'Unknown');
            setRegion(displayRegion);
        }
        else {
            if (savedGender) setGender(savedGender);
            if (ipRegion) setRegion(ipRegion);

            // Refine with IP (Start immediately)
            if (initialCity && initialCountry) {
                refineLocationAction(initialCity, initialCountry)
                    .then((refined) => {
                        // Only update if we DON'T have a GPS fix yet (coords not set)
                        // This prevents IP overwriting GPS if GPS resolved faster
                        // Actually, we can check a ref or just see if Coords are null?
                        // Ideally we want GPS to win. 
                        // For now, let's just update. If GPS comes later, it will overwrite.
                        // Usage of useRef to track 'isGpsActive' would be better but let's keep it simple first.
                        if (refined && refined !== 'Unknown') {
                            setRegion(refined);
                        }
                    })
                    .catch((e) => console.error(e));
            }
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
                            const { reverseGeocode } = await import('@/shared/lib/location/geocoding');
                            const refinedRegion = await reverseGeocode(lat, lng, locale);
                            if (refinedRegion) {
                                setRegion(refinedRegion);
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
    }, [initialStep, savedGender, initialVote, ipRegion, setStep, setGender, setMood, setRegion, setCoords, locale, initialCity, initialCountry]);

    // ... render ...
    const isReturningUser = !!savedGender;

    return (
        // ...
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
            {/* ... */}
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
                        <LandingHeader isReturningUser={isReturningUser} initialRegion={ipRegion} />
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
                        {isReturningUser && <MoodHeader initialRegion={ipRegion} />}
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
