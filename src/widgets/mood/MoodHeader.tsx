import { useTranslations } from 'next-intl';
import { FadeIn } from '@/shared/ui/MotionWrapper';
import { useVoteStore } from '@/features/vote/model/useVoteStore';
import { LocationSlotMachine } from '@/shared/ui/LocationSlotMachine';

interface MoodHeaderProps {
    initialRegion?: string;
}

export function MoodHeader({ initialRegion }: MoodHeaderProps) {
    const t = useTranslations('vote.header');
    const common = useTranslations('common');
    const { region, region_std } = useVoteStore();

    // Prioritize Store -> Server Prop -> Hard Fallback
    let displayRegion = region || initialRegion || "서울";
    if (region_std == 'global') displayRegion = common('world');

    return (
        <div className="flex flex-col items-center justify-center gap-6 text-center px-4 mb-4">
            <FadeIn>
                <h2 className="text-gray-500 text-lg whitespace-pre-line">
                    {t.rich('title', {
                        region: displayRegion,
                        highlight: (chunks) => (
                            <span className="text-blue-600 font-extrabold mx-1">
                                <LocationSlotMachine text={chunks as string} />
                            </span>
                        )
                    })}
                </h2>
            </FadeIn>
        </div>
    );
}
