import { useTranslations } from 'next-intl';
import { FadeIn } from '@/shared/ui/MotionWrapper';
import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingHeaderProps {
    isReturningUser?: boolean;
}

export function LandingHeader({ isReturningUser = false }: LandingHeaderProps) {
    const t = useTranslations('home.hero');
    const { region } = useVoteStore();

    // Default to '...' or something indicative if region is strictly null (though IP should catch it)
    const displayRegion = region || "서울"; // Fallback to major city if all else fails

    return (
        <div className="flex flex-col items-center justify-center gap-8 text-center px-4 mb-8">
            <FadeIn>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 whitespace-pre-line">
                    {t.rich('title', {
                        region: displayRegion,
                        highlight: (chunks) => (
                            <span className="text-blue-500 inline-flex flex-col h-[1.1em] overflow-hidden align-bottom relative min-w-[3ch] vertical-align-text-bottom">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.span
                                        key={displayRegion}
                                        initial={{ y: "100%", opacity: 0 }}
                                        animate={{ y: "0%", opacity: 1 }}
                                        exit={{ y: "-100%", opacity: 0 }}
                                        transition={{
                                            // "Chewy/Sticky" feel: BackIn for exit (wind up), BackOut for enter (overshoot)
                                            // User requested "Slow -> Fast up".
                                            // Duration 0.5s.
                                            // Using a custom bezier or easeInBack.
                                            y: { type: "spring", stiffness: 200, damping: 20, mass: 1 },
                                            opacity: { duration: 0.2 }
                                        }}
                                        className="inline-block whitespace-nowrap absolute left-0 right-0"
                                    >
                                        {chunks}
                                    </motion.span>
                                </AnimatePresence>
                                {/* Invisible spacer to keep width correct if absolute positioning fails or flickers */}
                                <span className="opacity-0">{chunks}</span>
                            </span>
                        )
                    })}
                </h1>
            </FadeIn>

            <FadeIn delay={0.8} className="flex flex-col gap-4 w-full max-w-xs">
                <p className="text-gray-500 text-lg animate-[nudge_2s_infinite_ease-in-out]">
                    {isReturningUser ? t('nudge_returning') : t('nudge')}
                </p>
            </FadeIn>
        </div>
    );
}
