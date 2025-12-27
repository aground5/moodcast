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
}

export default function HomePage({ initialStep, savedGender }: HomePageProps) {
    const { step, setStep, setGender, setCoords } = useVoteStore();

    useEffect(() => {
        if (initialStep === 'result') {
            setStep('result');
        } else if (savedGender) {
            setGender(savedGender);
        }

        // Location Tracking: Attempt to get high-accuracy location
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    // Silently fail, server will fall back to IP
                    console.log('Location access denied/unavailable:', error);
                },
                { timeout: 5000, maximumAge: 60000 }
            );
        }
    }, [initialStep, savedGender, setStep, setGender, setCoords]);

    const isReturningUser = !!savedGender;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-slate-50 to-white">
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
