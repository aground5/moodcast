import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
    // 1. Run next-intl middleware first to handle redirects and locale detection
    const response = intlMiddleware(request);

    // 1.5 Infinite Session: Ensure User ID exists
    let userId = request.cookies.get('moodcast_uid')?.value;
    if (!userId) {
        userId = crypto.randomUUID();
        response.cookies.set('moodcast_uid', userId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365 * 100, // 100 years
            sameSite: 'lax',
            httpOnly: false,
        });
        // Also set it on the request so downstream can see it immediately if needed (though we usually use response cookies for next load)
        request.cookies.set('moodcast_uid', userId);
    }

    // 2. Configure Supabase client on the response object
    // (Supabase needs to read/write cookies to the response)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                    });
                    // Update the response cookies as well
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // 3. Refresh session (this handles the token refresh if needed)
    await supabase.auth.getUser();

    return response;
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
