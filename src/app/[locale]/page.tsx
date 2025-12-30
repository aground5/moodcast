import HomePage from '@/views/home/HomePage';
import { cookies } from 'next/headers';
import { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { createAdminClient } from '@/shared/lib/supabase/admin';

// Revalidate every 60 seconds (or 0 for real-time) - adjusting based on demand
export const revalidate = 60;

type Props = {
    params: { locale: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { locale } = params;
    const t = await getTranslations({ locale, namespace: 'metadata' });
    const common = await getTranslations({ locale, namespace: 'common' });

    // 1. Determine Region (Priority: lv0/1/2 Snapshot -> IP Header -> Default)
    const lv0 = searchParams.lv0 as string;
    const lv1 = searchParams.lv1 as string;
    const lv2 = searchParams.lv2 as string;

    let regionName = '';
    let regionStd = '';

    if (lv0 || lv1 || lv2) {
        // Use Stats to resolve localized name for the snapshot
        const { getDashboardStats } = await import('@/widgets/dashboard/actions/getDashboardStats');
        const stats = await getDashboardStats({
            region_std_lv0: lv0,
            region_std_lv1: lv1,
            region_std_lv2: lv2
        });
        regionName = stats.region;
        regionStd = stats.region_std || '';
    } else {
        // Fallback to IP detection
        const { detectLocationFromHeaders } = await import('@/shared/lib/location/server');
        const { timezone, region1, region0, std } = await detectLocationFromHeaders(locale);
        regionName = region0;
        regionStd = std?.region0 || '';
    }

    if (regionStd == 'Unknown') {
        regionStd = 'Global'
        regionName = common('world');
    }

    // 2. Construct OG Image URL
    const ogUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og`);
    if (lv0) ogUrl.searchParams.set('lv0', lv0);
    if (lv1) ogUrl.searchParams.set('lv1', lv1);
    if (lv2) ogUrl.searchParams.set('lv2', lv2);

    const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/${locale}`);
    if (lv0) url.searchParams.set('lv0', lv0);
    if (lv1) url.searchParams.set('lv1', lv1);
    if (lv2) url.searchParams.set('lv2', lv2);

    // If no params, /api/og defaults to fallback logic (Global or Seoul ip?)

    return {
        title: `Moodcast: ${regionName}`,
        description: t('description', { region: regionName }),
        openGraph: {
            title: `Moodcast | ${regionName} Vibe`,
            description: t('og_description'),
            url: url.toString(),
            siteName: 'Moodcast',
            images: [
                {
                    url: ogUrl.toString(),
                    width: 1200,
                    height: 630,
                    alt: `${regionName} Mood Snapshot`,
                },
            ],
            locale: locale,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `Moodcast | ${regionName}`,
            description: t('og_description'),
            images: [ogUrl.toString()],
        },
        other: {
            'moodcast:region': regionName,
            'moodcast:region_std': regionStd || '', // valid primitive
        }
    };
}

export default async function Page({ searchParams }: Props) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('moodcast_uid')?.value;

    let hasVoted = false;
    let initialVote = null;

    // 3. IP Location & Timezone (for initial display)
    const locale = await getLocale();
    const { detectLocationFromHeaders } = await import('@/shared/lib/location/server');
    const { timezone, region1, region0, std } = await detectLocationFromHeaders(locale);

    // Initial display regions
    // Snapshot Logic: If URL has hierarchical params, use them as priority
    const slv0 = searchParams.lv0 as string;
    const slv1 = searchParams.lv1 as string;
    const slv2 = searchParams.lv2 as string;

    const hasSnapshot = !!(slv0 || slv1 || slv2);
    let initialStats: any = null;

    if (hasSnapshot) {
        const { getDashboardStats } = await import('@/widgets/dashboard/actions/getDashboardStats');
        initialStats = await getDashboardStats({
            region_std_lv0: slv0,
            region_std_lv1: slv1,
            region_std_lv2: slv2
        }, timezone);
    }

    // 4. Optimization: Check Cookie Timestamp (Timezone Aware)
    const { getStartOfDayUTC } = await import('@/shared/lib/date/timezone');
    const startOfTodayUTC = getStartOfDayUTC(timezone);

    let shouldFetchDB = true;
    const lastVotedAt = cookieStore.get('moodcast_last_voted_at')?.value;

    if (userId && lastVotedAt) {
        const lastVotedDate = new Date(lastVotedAt);
        const startOfTodayDate = new Date(startOfTodayUTC);

        if (lastVotedDate < startOfTodayDate) {
            shouldFetchDB = false;
        }
    }

    // 2. DB Check / Fetch
    if (userId && shouldFetchDB) {
        const supabase = createAdminClient();

        const { data } = await supabase
            .from('mood_votes')
            .select('mood, gender, created_at, region_lv2, region_lv1, region_lv0, region_std_lv2, region_std_lv1, region_std_lv0, analysis_text')
            .eq('user_id', userId)
            .gte('created_at', startOfTodayUTC)
            .limit(1)
            .single();

        if (data) {
            hasVoted = true;
            initialVote = data;
        }
    }

    const savedGender = cookieStore.get('moodcast_gender')?.value as 'male' | 'female' | undefined;
    const initialStep = hasVoted ? 'result' : 'gender';

    let initialAnalysis: string | undefined;

    if (hasVoted && initialVote) {
        const { getDashboardStats } = await import('@/widgets/dashboard/actions/getDashboardStats');
        initialAnalysis = initialVote.analysis_text || undefined;
        initialStats = await getDashboardStats({
            region_lv2: initialVote.region_lv2 !== 'Unknown' ? initialVote.region_lv2 : undefined,
            region_lv1: initialVote.region_lv1 !== 'Unknown' ? initialVote.region_lv1 : undefined,
            region_lv0: initialVote.region_lv0 !== 'Unknown' ? initialVote.region_lv0 : undefined,
            region_std_lv2: initialVote.region_std_lv2 !== 'Unknown' ? initialVote.region_std_lv2 : undefined,
            region_std_lv1: initialVote.region_std_lv1 !== 'Unknown' ? initialVote.region_std_lv1 : undefined,
            region_std_lv0: initialVote.region_std_lv0 !== 'Unknown' ? initialVote.region_std_lv0 : undefined
        }, timezone);
    } else if (hasSnapshot && !initialStats) {
        // Pre-fetched above for snapshot, ensuring it's available
    }

    return (
        <>
            <HomePage
                initialStep={initialStep}
                savedGender={savedGender}
                initialVote={initialVote}
                initialLv0={region0}
                initialStdLv0={std?.region0}
                initialAnalysis={initialAnalysis}
                initialStats={initialStats}
            />

            {/* GEO: JSON-LD for AI Agents */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Dataset",
                        "name": `Moodcast Real-time Vibe Index - ${initialStats?.region || region0}`,
                        "description": `Real-time sentiment analysis report for ${initialStats?.region_std || std?.region0}`,
                        "variableMeasured": "Happiness Index",
                        "value": `${initialStats?.score || 0}%`,
                        "datePublished": new Date().toISOString(),
                        "creator": {
                            "@type": "Organization",
                            "name": "Moodcast",
                            "url": "https://moodcast.kr"
                        },
                        "keywords": [
                            "Happiness Index",
                            "Mood Forecast",
                            initialStats?.region || region1 || "Korea",
                            initialStats?.region_std || std?.region1 || "Korea"
                        ]
                    })
                }}
            />
        </>
    );
}
