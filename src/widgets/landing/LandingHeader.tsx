import { useTranslations } from 'next-intl';
import { FadeIn } from '@/shared/ui/MotionWrapper';
import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { LocationSlotMachine } from '@/shared/ui/LocationSlotMachine';

interface LandingHeaderProps {
    isReturningUser?: boolean;
    initialRegion?: string;
}

export function LandingHeader({ isReturningUser = false, initialRegion }: LandingHeaderProps) {
    const t = useTranslations('home.hero');
    const common = useTranslations('common');
    const { region, region_std } = useVoteStore();

    // Prioritize Store -> Server Prop -> Hard Fallback
    let displayRegion = region || initialRegion || "서울";
    if (region_std == 'global') displayRegion = common('world');

    return (
        <div className="flex flex-col items-center justify-center gap-8 text-center px-4 mb-8">
            <FadeIn>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 whitespace-pre-line">
                    {t.rich('title', {
                        region: displayRegion,
                        highlight: (chunks) => (
                            <span className="text-blue-500">
                                <LocationSlotMachine text={chunks as string} />
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
