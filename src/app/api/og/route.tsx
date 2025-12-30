import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getDashboardStats } from '@/widgets/dashboard/actions/getDashboardStats';

// 멘트 DB를 가볍게 하드코딩하거나, 필요한 부분만 import (Edge 최적화)
// 실제로는 i18n 파일에서 가져오는 것이 좋으나, Edge 환경 호환성을 위해 핵심 문구만 매핑합니다.
const MENT_DB: Record<string, string[]> = {
    good: [
        "{region}은(는) 지금 결점 제로 지대! ✨",
        "천국이 있다면 바로 {region} 아닐까요? ☀️",
        "도시 전체가 긍정 에너지로 빛나고 있습니다! 🔥"
    ],
    bad: [
        "{region}의 기운이 나쁩니다. 이불 밖은 위험해요! 🚩",
        "재난 영화 도입부 같네요. 모두가 예민합니다. ☁️",
        "분노로 가득 찬 {region}... 생존 전략이 필요합니다. 🫠"
    ],
    neutral: [
        "{region}의 기류는 평범함 그 자체입니다.",
        "적당히 흐리고 적당히 맑은, 미묘한 분위기네요.",
        "폭풍전야일까요? 아직은 잠잠합니다."
    ]
};

// Global Translation Map for OG Image
const WORLD_NAMES: Record<string, string> = {
    de: "Welt",
    en: "World",
    es: "Mundo",
    fr: "Monde",
    ja: "世界",
    ko: "전 세계",
    pt: "Mundo",
    ru: "Мир",
    zh: "世界",
};

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    // 1. 폰트 로딩 (한글 깨짐 방지 - Local Public Asset)
    // Edge에서도 URL을 통해 public 폴더의 에셋을 fetch 할 수 있습니다.
    const { searchParams, origin } = new URL(request.url);

    const fontData = await fetch(new URL(`${origin}/NotoSansKR-Bold.ttf`)).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch local font');
        return res.arrayBuffer();
    });

    // 2. Parse Region Parameters (lv0=Country, lv1=City, lv2=District)
    const lv0 = searchParams.get('lv0') || undefined;
    const lv1 = searchParams.get('lv1') || undefined;
    const lv2 = searchParams.get('lv2') || undefined;

    // 3. Data Fetching via V2 Logic (Waterfall lookup)
    const stats = await getDashboardStats({
        region_std_lv2: lv2,
        region_std_lv1: lv1,
        region_std_lv0: lv0
    });

    const score = stats.score;
    let displayRegion = stats.region;

    // Localization for 'Global'
    if (displayRegion === 'Global') {
        const acceptLanguage = request.headers.get('accept-language') || 'en';
        // Parse primary language code (e.g. "ko-KR,en;q=0.9" -> "ko")
        const primaryLocale = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
        displayRegion = WORLD_NAMES[primaryLocale] || 'World';
    }

    const moodState = score >= 60 ? 'good' : score <= 40 ? 'bad' : 'neutral';

    // 3. 멘트 선정 (랜덤)
    const candidates = MENT_DB[moodState];
    const rawMent = candidates[Math.floor(Math.random() * candidates.length)];
    const ment = rawMent.replace('{region}', displayRegion);

    // 디자인 테마 결정
    const theme = {
        good: { bg: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', color: '#2563eb', icon: '☀️' },
        bad: { bg: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)', color: '#dc2626', icon: '⚡️' },
        neutral: { bg: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)', color: '#4b5563', icon: '☁️' }
    }[moodState];

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: theme.bg,
                    fontFamily: '"NotoSansKR"',
                    padding: '40px',
                    textAlign: 'center'
                }}
            >
                {/* 상단: 아이콘 및 타이틀 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', fontSize: 80, marginBottom: 10 }}>{theme.icon}</div>
                    <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Moodcast Now
                    </div>
                </div>

                {/* 중앙: 점수 및 지역 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'flex', fontSize: 50, fontWeight: 900, color: '#111827', marginBottom: 0 }}>
                        {displayRegion}
                    </div>
                    <div style={{ display: 'flex', fontSize: 110, fontWeight: 900, color: theme.color, lineHeight: 1 }}>
                        {score}%
                    </div>
                </div>

                {/* 하단: 상황 묘사 멘트 (핵심) */}
                <div style={{
                    display: 'flex',
                    padding: '20px 40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 30,
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', fontSize: 36, fontWeight: 600, color: '#1f2937', wordBreak: 'keep-all', lineHeight: 1.4 }}>
                        "{ment}"
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'NotoSansKR',
                    data: fontData,
                    style: 'normal',
                    weight: 700,
                },
            ],
            // 1시간 캐싱 (지역 기류가 급격히 바뀌진 않으므로 적절)
            headers: {
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        },
    );
}
