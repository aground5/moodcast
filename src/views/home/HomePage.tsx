"use client";

import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { GenderSelector } from '@/features/vote/ui/GenderSelector';
import { MoodSelector } from '@/features/vote/ui/MoodSelector';
import { LandingHeader } from '@/widgets/landing/LandingHeader';
import { Dashboard } from '@/widgets/dashboard/ui/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

interface HomePageProps {
    initialStep: 'gender' | 'result';
    savedGender?: 'male' | 'female';
    initialVote?: any; // strict type would be better but keeping it simple for now
    ipRegion?: string;
}

export default function HomePage({ initialStep, savedGender, initialVote, ipRegion }: HomePageProps) {
    const { step, setStep, setGender, setMood, setRegion, setCoords } = useVoteStore();

    useEffect(() => {
        // 1. Prioritize Server Data (Vote Record)
        if (initialVote) {
            setGender(initialVote.gender);
            setMood(initialVote.mood);
            if (initialVote.region_lv2) {
                setRegion(initialVote.region_lv2);
            }
        }
        // 2. If no vote record, use IP Region as initial guess
        else {
            if (savedGender) setGender(savedGender);
            if (ipRegion) setRegion(ipRegion);
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
                        className="w-full flex justify-center"
                    >
                        <Dashboard />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
