'use server';

import { getLocale } from 'next-intl/server';
import { localizeLocationViaNominatim } from '@/shared/lib/location';

export async function refineLocationAction(city: string, country: string) {
    const locale = await getLocale();

    // Fetch Localized and Standard English names in parallel
    const [result, resultEn] = await Promise.all([
        localizeLocationViaNominatim(city, country, locale),
        localizeLocationViaNominatim(city, country, 'en')
    ]);

    let localized = null;
    if (result) {
        // Prefer District (region2) -> City (region1)
        if (result.region2 && result.region2 !== 'Unknown') localized = result.region2;
        else if (result.region1 && result.region1 !== 'Unknown') localized = result.region1;
    }

    let std = null;
    if (resultEn) {
        if (resultEn.region2 && resultEn.region2 !== 'Unknown') std = resultEn.region2;
        else if (resultEn.region1 && resultEn.region1 !== 'Unknown') std = resultEn.region1;
    }

    return { localized, std };
}
