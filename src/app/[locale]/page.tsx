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

    // 1. Determine Region (Priority: Query Param -> IP Header -> Default)
    let regionName = searchParams.region as string;
    let regionStd = searchParams.region_std as string | undefined;

    if (!regionName) {
        // Fallback to IP detection if no snapshot param
        const { detectLocationFromHeaders } = await import('@/shared/lib/location');
        const { region1, std } = await detectLocationFromHeaders(locale);
        regionName = region1 !== 'Unknown' ? region1 : '서울';
        regionStd = std?.region1 !== 'Unknown' ? std.region1 : undefined; // Optional
    }

    // 2. Fetch Stats for Score (Optional, but adds nice context to title)
    // If it's a Snapshot, we might want to respect the snapshot vibe?
    // But generating real-time score for the title is better than static.
    // For OG Image, we pass params to /api/og.

    // 3. Construct OG Image URL
    const ogUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/og`);
    if (regionName) ogUrl.searchParams.set('region', regionName);
    if (regionStd) ogUrl.searchParams.set('region_std', regionStd);

    // Pass precise levels if available (Snapshot scenario)
    if (searchParams.lv0) ogUrl.searchParams.set('lv0', searchParams.lv0 as string);
    if (searchParams.lv1) ogUrl.searchParams.set('lv1', searchParams.lv1 as string);
    if (searchParams.lv2) ogUrl.searchParams.set('lv2', searchParams.lv2 as string);

    // If no params, /api/og defaults to fallback logic (Global or Seoul ip?)

    return {
        title: `Moodcast: ${regionName}`,
        description: t('description', { region: regionName }),
        openGraph: {
            title: `Moodcast | ${regionName} Vibe`,
            description: t('og_description'),
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}?region=${regionName}`,
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
    const { detectLocationFromHeaders } = await import('@/shared/lib/location');
    const { timezone, region1, region0, std } = await detectLocationFromHeaders(locale);

    // Initial display regions
    // Snapshot Logic: If URL has params, use them as priority Default
    const snapshotRegion = searchParams.region as string;
    const snapshotRegionStd = searchParams.region_std as string;

    let ipRegion = snapshotRegion || (region0 !== 'Unknown' ? region0 : "대한민국");
    // We pass standard names for refinement & consistency
    let initialCity = snapshotRegion || (region1 !== 'Unknown' ? region1 : undefined);
    let initialCityStd = snapshotRegionStd || (std?.region1 !== 'Unknown' ? std.region1 : undefined);
    let ipRegionStd = std?.region0 !== 'Unknown' ? std.region0 : "South Korea";

    // If snapshot is detailed (city level), ensuring it flows down
    // Actually HomePage takes ipRegion as "Country/Broad" and initialCity as "Specific"
    // If snapshotRegion is "Gangnam-gu", we should probably pass it as initialCity.
    if (snapshotRegion) {
        initialCity = snapshotRegion;
        // If we have snapshot, we display it.
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

    // 4. SSR Analysis & Stats
    let initialAnalysis: string | undefined;
    let initialStats: any = null; // Type: DashboardStats

    if (hasVoted && initialVote) {
        const { getDashboardStats } = await import('@/widgets/dashboard/actions/getDashboardStats');
        initialStats = await getDashboardStats({
            region_lv2: initialVote.region_lv2 || undefined,
            region_lv1: initialVote.region_lv1 || undefined,
            region_lv0: initialVote.region_lv0 || undefined,
            region_std_lv2: initialVote.region_std_lv2 || undefined,
            region_std_lv1: initialVote.region_std_lv1 || undefined,
            region_std_lv0: initialVote.region_std_lv0 || undefined
        }, timezone);
    }

    return (
        <>
            <HomePage
                initialStep={initialStep}
                savedGender={savedGender}
                initialVote={initialVote}
                ipRegion={ipRegion}
                ipRegionStd={ipRegionStd}
                initialCountry={region0}
                initialCity={initialCity}
                initialCityStd={initialCityStd}
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
                        "name": `Moodcast Real-time Vibe Index - ${initialStats?.region || ipRegion}`,
                        "description": `Real-time sentiment analysis report for ${initialStats?.region_std || ipRegionStd}`,
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
