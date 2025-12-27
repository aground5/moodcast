import { useTranslations } from 'next-intl';
import { FadeIn } from '@/shared/ui/MotionWrapper';

interface LandingHeaderProps {
    isReturningUser?: boolean;
}

export function LandingHeader({ isReturningUser = false }: LandingHeaderProps) {
    const t = useTranslations('home.hero');

    // Mock Region (In real app, fetch from IP)
    const region = "마포구";

    return (
        <div className="flex flex-col items-center justify-center gap-8 text-center px-4 mb-8">
            <FadeIn>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
                    지금 <span className="text-blue-500">{region}</span>의<br />
                    기류에 동기화하세요.
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
