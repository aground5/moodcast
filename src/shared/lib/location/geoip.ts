import { Reader, ReaderModel } from '@maxmind/geoip2-node';
import path from 'path';

// Cache the reader instance to reuse across requests in the same warm container
let reader: ReaderModel | null = null;

async function getReader() {
    if (!reader) {
        // Use the static file we downloaded locally
        const dbPath = path.join(process.cwd(), 'src/shared/assets/GeoLite2-City.mmdb');
        reader = await Reader.open(dbPath);
    }
    return reader;
}

export type GeoIPResult = {
    country: string;
    city: string;
    timezone: string;
    countryCode?: string;
    subdivision?: string;
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
        const countryCode = response.country?.isoCode || 'Unknown';

        return {
            country,
            city,
            timezone,
            countryCode,
            subdivision: (response.subdivisions && response.subdivisions.length > 0)
                ? ((response.subdivisions[0].names as any)?.[locale] || (response.subdivisions[0].names as any)?.['en'])
                : undefined
        };
    } catch (e) {
        // IP not found or invalid
        // console.error('GeoIP Lookup failed:', e);
        return null;
    }
}
