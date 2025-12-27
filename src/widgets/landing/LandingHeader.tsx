import { useTranslations } from 'next-intl';
import { FadeIn } from '@/shared/ui/MotionWrapper';
import { useVoteStore } from '@/features/vote/model/useVoteStore';

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
                        highlight: (chunks) => <span className="text-blue-500">{chunks}</span>
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
