'use server';

import { getLocale } from 'next-intl/server';
import { localizeLocationViaNominatim } from '@/shared/lib/location';

export async function refineLocationAction(city: string, country: string) {
    const locale = await getLocale();
    const result = await localizeLocationViaNominatim(city, country, locale);

    // Return just the region1 (City) for now, or the whole object if we want to update more.
    // The user wants "City" to be localized.
    if (result && result.region1 && result.region1 !== 'Unknown') {
        return result.region1;
    }
    return null;
}
