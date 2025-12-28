import { useVoteStore } from '../model/useVoteStore';
import { submitVote } from '../api/submitVote';
import { Card } from '@/shared/ui/Card';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export function MoodSelector() {
    const t = useTranslations('vote.mood');
    const { gender, setMood, setStep, setRegion, coords } = useVoteStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for Charge Logic
    const [holdingMood, setHoldingMood] = useState<'good' | 'bad' | null>(null);
    const [isCharged, setIsCharged] = useState(false);

    // Timer Ref
    const holdTimer = useRef<NodeJS.Timeout | null>(null);

    const triggerVote = async (mood: 'good' | 'bad') => {
        if (!gender || isSubmitting) return;

        // Final Vibrate on Submit
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }

        setIsSubmitting(true);
        setMood(mood);

        try {
            const result = await submitVote(gender, mood, coords || undefined);
            if (result.region) {
                setRegion(result.region);
            }
            setStep('result');
        } catch (e) {
            console.error(e);
            setIsSubmitting(false);
            setHoldingMood(null);
            setIsCharged(false);
        }
    };

    const startCharge = (mood: 'good' | 'bad') => {
        if (isSubmitting) return;
        setHoldingMood(mood);
        setIsCharged(false);

        holdTimer.current = setTimeout(() => {
            // CHARGE COMPLETE
            setIsCharged(true);
            // Tactile feedback that charge is done
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(100); // Stronger pulse
            }
        }, 800); // 0.8s Charge Duration
    };

    const releaseCharge = (mood: 'good' | 'bad') => {
        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }

        if (isCharged) {
            // TRIGGER VOTE if charged
            triggerVote(mood);
        } else {
            // CANCEL if not charged
            setHoldingMood(null);
            setIsCharged(false);
        }
    };

    // Global Background Color Shift
    const getOverlayColor = () => {
        if (holdingMood === 'good') return 'bg-blue-50';
        if (holdingMood === 'bad') return 'bg-gray-100';
        return 'bg-transparent';
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-sm select-none relative z-10">
            {/* Global Overlay for Atmosphere Shift */}
            <motion.div
                className={`fixed inset-0 pointer-events-none z-[-1] transition-colors duration-500 ${getOverlayColor()}`}
                animate={{ opacity: holdingMood ? 0.9 : 0 }}
                initial={{ opacity: 0 }}
            />

            <h2 className="text-2xl font-bold text-center text-gray-800">
                {t('question')}
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {/* Good Option */}
                <div
                    className="relative"
                    onPointerDown={() => startCharge('good')}
                    onPointerUp={() => releaseCharge('good')}
                    onPointerLeave={() => releaseCharge('good')}
                >
                    <motion.div
                        animate={
                            isCharged
                                ? { scale: 1.05, filter: "brightness(1.05)" }
                                : holdingMood === 'good'
                                    ? { scale: 0.98 }
                                    : { scale: 1 }
                        }
                        transition={{ duration: 0.2 }}
                    >
                        <Card className={`relative overflow-hidden cursor-pointer flex items-center justify-between px-6 py-5 md:px-8 md:py-6 z-10 transition-colors duration-500 border-2 ${isCharged && holdingMood === 'good' ? 'border-blue-500 shadow-lg shadow-blue-200' : 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100'}`}>
                            {/* Filling Background Effect */}
                            {holdingMood === 'good' && !isCharged && (
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 0.8, ease: "linear" }}
                                    className="absolute inset-0 bg-blue-300 opacity-30 z-0"
                                    style={{ left: 0, top: 0, bottom: 0 }}
                                />
                            )}
                            {isCharged && holdingMood === 'good' && (
                                <motion.div
                                    className="absolute inset-0 bg-blue-400 opacity-20 z-0 animate-pulse"
                                />
                            )}

                            <div className="relative z-10 flex items-center justify-between w-full pointer-events-none">
                                <span className={`text-xl font-bold ${isCharged && holdingMood === 'good' ? 'text-blue-600' : 'text-blue-700'}`}>{t('good')}</span>
                                <span className="text-4xl">😊</span>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Bad Option */}
                <div
                    className="relative"
                    onPointerDown={() => startCharge('bad')}
                    onPointerUp={() => releaseCharge('bad')}
                    onPointerLeave={() => releaseCharge('bad')}
                >
                    <motion.div
                        animate={
                            isCharged
                                ? { scale: 1.05, filter: "brightness(1.05)" }
                                : holdingMood === 'bad'
                                    ? { scale: 0.98 }
                                    : { scale: 1 }
                        }
                        transition={{ duration: 0.2 }}
                    >
                        <Card className={`relative overflow-hidden cursor-pointer flex items-center justify-between px-6 py-5 md:px-8 md:py-6 z-10 transition-colors duration-500 border-2 ${isCharged && holdingMood === 'bad' ? 'border-gray-500 shadow-lg shadow-gray-200' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                            {/* Filling Background Effect */}
                            {holdingMood === 'bad' && !isCharged && (
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 0.8, ease: "linear" }}
                                    className="absolute inset-0 bg-gray-400 opacity-30 z-0"
                                    style={{ left: 0, top: 0, bottom: 0 }}
                                />
                            )}
                            {isCharged && holdingMood === 'bad' && (
                                <motion.div
                                    className="absolute inset-0 bg-gray-500 opacity-20 z-0 animate-pulse"
                                />
                            )}

                            <div className="relative z-10 flex items-center justify-between w-full pointer-events-none">
                                <span className={`text-xl font-bold ${isCharged && holdingMood === 'bad' ? 'text-gray-700' : 'text-gray-600'}`}>{t('bad')}</span>
                                <span className="text-4xl">🫠</span>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Instructional Text */}
            <div className="h-6 mt-4 flex items-center justify-center">
                {holdingMood && !isCharged && (
                    <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-gray-500 font-medium"
                    >
                        {t('instruction_hold')}
                    </motion.p>
                )}
                {isCharged && (
                    <motion.p
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1.1 }}
                        className="text-sm text-blue-600 font-bold animate-pulse"
                    >
                        {t('instruction_release')}
                    </motion.p>
                )}
                {!holdingMood && (
                    <p className="text-sm text-gray-400">
                        {t('instruction_default')}
                    </p>
                )}
            </div>
        </div>
    );
}
