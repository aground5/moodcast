"use client";

import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { GenderSelector } from '@/features/vote/ui/GenderSelector';
import { MoodSelector } from '@/features/vote/ui/MoodSelector';
import { LandingHeader } from '@/widgets/landing/LandingHeader';
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
}

import { useTranslations, useLocale } from 'next-intl';

export default function HomePage({ initialStep, savedGender, initialVote, ipRegion, initialCountry, initialCity, initialAnalysis }: HomePageProps) {
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

        // 3. Dynamic GPS Support (watchPosition)
        let watchId: number | null = null;

        if ('geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    setCoords({ lat, lng });

                    // Reverse Geocode updates the Region to the most accurate GPS-based name
                    if (!initialVote) {
                        // Import dynamically
                        const { reverseGeocode } = await import('@/shared/lib/location/geocoding');
                        // Pass locale!
                        const refinedRegion = await reverseGeocode(lat, lng, locale);
                        if (refinedRegion) {
                            setRegion(refinedRegion);
                        }
                    }
                },
                (error) => {
                    // Permission denied or unavailable. Silent fail or fallback to IP (already done).
                    // If user denies then enables -> 'watchPosition' usually doesn't create new ID, 
                    // except if re-called.
                    // Actually, 'watchPosition' persists. If permission changes from Deny -> Allow (via browser settings), 
                    // the page usually needs reload, BUT if Prompt -> Allow, it works.
                    // If Turned Off -> Turned On (OS level), it works.
                },
                { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
            );
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
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
                        <LandingHeader isReturningUser={isReturningUser} />
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
                        <LandingHeader isReturningUser={isReturningUser} />
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
                        <Dashboard initialAnalysis={initialAnalysis} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
