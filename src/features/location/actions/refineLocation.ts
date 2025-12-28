'use server';

import { getLocale } from 'next-intl/server';
import { localizeLocationViaNominatim } from '@/shared/lib/location';

export async function refineLocationAction(city: string, country: string) {
    const locale = await getLocale();
    const result = await localizeLocationViaNominatim(city, country, locale);

    // Return the best available localized name.
    // If Nominatim found a District (region2), return that.
    // If not, return City (region1).
    if (result) {
        if (result.region2 && result.region2 !== 'Unknown') return result.region2;
        if (result.region1 && result.region1 !== 'Unknown') return result.region1;
    }
    return null;
}
