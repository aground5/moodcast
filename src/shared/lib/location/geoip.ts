import { Reader, ReaderModel } from '@maxmind/geoip2-node';
// @ts-ignore -- geolite2-redist doesn't have good types
import * as geolite2 from 'geolite2-redist';

// Cache the reader instance to reuse across requests in the same warm container
let reader: ReaderModel | null = null;

async function getReader() {
    if (!reader) {
        // geolite2.open returns a Promise<string> (path)
        const dbPath = await geolite2.open(
            'GeoLite2-City' as any, // Library types are inconsistent
            (path: string) => Promise.resolve(path)
        );
        reader = await Reader.open(dbPath);
    }
    return reader;
}

export type GeoIPResult = {
    country: string;
    city: string;
    timezone: string;
};

export const MAXMIND_SUPPORTED_LOCALES = ['de', 'en', 'es', 'fr', 'ja', 'pt-BR', 'ru', 'zh-CN'];

export async function lookupIP(ip: string, locale: string = 'en'): Promise<GeoIPResult | null> {
    try {
        const readerInstance = await getReader();
        const response = readerInstance.city(ip);

        // Cast to any to allow dynamic access to names
        const countryNames = response.country?.names as any;
        const cityNames = response.city?.names as any;

        const country = countryNames?.[locale] || countryNames?.['en'] || 'Unknown';
        const city = cityNames?.[locale] || cityNames?.['en'] || 'Unknown';
        const timezone = response.location?.timeZone || 'Asia/Seoul';

        return {
            country,
            city,
            timezone
        };
    } catch (e) {
        // IP not found or invalid
        // console.error('GeoIP Lookup failed:', e);
        return null;
    }
}
