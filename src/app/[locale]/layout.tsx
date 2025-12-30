import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, Geist_Mono } from "next/font/google"; // High quality Korean font
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { createClient } from '../../shared/lib/supabase/server';

const notoSansKr = Noto_Sans_KR({
    subsets: ['latin'],
    weight: ['100', '300', '400', '500', '700', '900'],
    variable: '--font-noto-sans-kr',
});

const notoSerifKr = Noto_Serif_KR({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-noto-serif-kr',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
});

export const metadata: Metadata = {
    title: {
        default: "Moodcast",
        template: "%s | Moodcast",
    },
    description: "지역 기반 감정 동기화 플랫폼에서 당신의 기분을 공유하세요.",
};

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = await getMessages();

    // Ensure Supabase session is refreshed
    await createClient();

    return (
        <html lang={locale}>
            <body className={`${notoSansKr.variable} ${notoSerifKr.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}>
                <NextIntlClientProvider messages={messages}>
                    <main className="flex-1">
                        {children}
                    </main>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
