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
    std: {
        country: string;
        city: string;
        subdivision?: string;
    };
    nominatimQuery?: string;
};

export const MAXMIND_SUPPORTED_LOCALES = ['de', 'en', 'es', 'fr', 'ja', 'pt-BR', 'ru', 'zh-CN'];

export async function lookupIP(ip: string, locale: string = 'en'): Promise<GeoIPResult | null> {
    try {
        const readerInstance = await getReader();
        const response = readerInstance.city(ip);

        // Cast to any to allow dynamic access to names
        const countryNames = response.country?.names as any;
        const cityNames = response.city?.names as any;

        // Localized Display Names
        const country = countryNames?.[locale] || countryNames?.['en'] || 'Unknown';
        const city = cityNames?.[locale] || cityNames?.['en'] || 'Unknown';

        // Standard English Names (for DB)
        const countryEn = countryNames?.['en'] || 'Unknown';
        const cityEn = cityNames?.['en'] || 'Unknown';

        const timezone = response.location?.timeZone || 'Asia/Seoul';
        const countryCode = response.country?.isoCode || 'Unknown';

        // Localized Subdivision
        const subdivisionRaw = (response.subdivisions && response.subdivisions.length > 0)
            ? response.subdivisions[0]
            : undefined;

        const subdivision = subdivisionRaw
            ? ((subdivisionRaw.names as any)?.[locale] || (subdivisionRaw.names as any)?.['en'])
            : undefined;

        const subdivisionEn = subdivisionRaw
            ? (subdivisionRaw.names as any)?.['en']
            : undefined;

        // Construct Robust Nominatim Query (English)
        // Format: City, Subdivision 1, Subdivision 2, ..., Country
        const queryParts: string[] = [];
        if (cityEn && cityEn !== 'Unknown') queryParts.push(cityEn);

        // Use ALL subdivisions if available
        if (response.subdivisions && response.subdivisions.length > 0) {
            response.subdivisions.forEach(sub => {
                const subName = (sub.names as any)?.['en'];
                if (subName) queryParts.push(subName);
            });
        }

        if (countryEn && countryEn !== 'Unknown') queryParts.push(countryEn);
        const nominatimQuery = queryParts.join(', ');

        return {
            country,
            city,
            timezone,
            countryCode,
            subdivision,
            std: {
                country: countryEn,
                city: cityEn,
                subdivision: subdivisionEn
            },
            nominatimQuery
        };
    } catch (e) {
        // IP not found or invalid
        // console.error('GeoIP Lookup failed:', e);
        return null;
    }
}
