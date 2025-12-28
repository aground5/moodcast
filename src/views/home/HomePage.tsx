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
    initialVote?: any; // strict type would be better but keeping it simple for now
    ipRegion?: string;
    initialCountry?: string;
    initialAnalysis?: string;
}

export default function HomePage({ initialStep, savedGender, initialVote, ipRegion, initialCountry, initialAnalysis }: HomePageProps) {
    const { step, setStep, setGender, setMood, setRegion, setCoords } = useVoteStore();

    useEffect(() => {
        // 1. Prioritize Server Data (Vote Record)
        if (initialVote) {
            setGender(initialVote.gender);
            setMood(initialVote.mood);

            // Use centralized logic to determine best display region from the vote record
            // If lv2 is unknown, it will fall back to lv1 (which might be preserved in other fields or acceptable fallback)
            // Note: initialVote structure usually has region_lv2, maybe region_lv1.
            // If not, we might rely on what we have.
            const displayRegion = getLocationDisplayName({
                region_lv2: initialVote.region_lv2,
                region_lv1: initialVote.region_lv1, // Assuming this might exist or be added
                region_lv0: initialVote.region_lv0
            }, initialVote.region_lv2 || 'Unknown'); // Fallback to raw lv2 if helper fails (though helper handles unknowns)

            setRegion(displayRegion);
        }
        // 2. If no vote record, use IP Region as initial guess
        else {
            if (savedGender) setGender(savedGender);
            if (ipRegion) setRegion(ipRegion);

            // Lazy Localization / Refinement (Animation)
            // If we have an initial Country (e.g. from MaxMind) and are showing an IP Region (City),
            // try to refine it via Nominatim to get the localized name.
            if (ipRegion && initialCountry) {
                refineLocationAction(ipRegion, initialCountry)
                    .then((refined) => {
                        // Check if refined result is valid before overwriting
                        if (refined && refined !== 'Unknown' && refined !== ipRegion) {
                            // Update UI with refined (localized) city name
                            setRegion(refined);
                        }
                    })
                    .catch((e) => console.error(e));
            }
        }

        if (initialStep === 'result') {
            setStep('result');
        }

        // 3. Refine with GPS (Client-Side)
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    setCoords({ lat, lng });

                    // Reverse Geocode for better name
                    // Only update if we haven't voted yet (voting handles its own region logic)
                    // OR if we want to show current location even if voted elsewhere? 
                    // Let's stick to "Current Location" logic for the Landing Page.
                    if (!initialVote) {
                        const { reverseGeocode } = await import('@/shared/lib/location/geocoding');
                        const refinedRegion = await reverseGeocode(lat, lng);
                        if (refinedRegion) {
                            setRegion(refinedRegion);
                        }
                    }
                },
                (error) => {
                    console.log('Location access denied/unavailable:', error);
                },
                { timeout: 5000, maximumAge: 60000 }
            );
        }
    }, [initialStep, savedGender, initialVote, ipRegion, setStep, setGender, setMood, setRegion, setCoords]);

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
                        transition={{ duration: 0.3 }}
                        className="w-full flex justify-center"
                    >
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
