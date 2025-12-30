'use server';

import { headers } from 'next/headers';
import { lookupIP, MAXMIND_SUPPORTED_LOCALES } from './geoip';
import { fetchGeocodeRaw } from './geocoding';
import { MoodcastLocation, mapNominatimAddress, USE_SUBDIVISION_AS_REGION1 } from './utils';

/**
 * Detects location and timezone.
 * Priority: MaxMind GeoIP (Local DB) -> Vercel Headers -> Unknown
 * 
 * @param locale Target locale for localization (e.g. 'ko')
 * @param options Configuration options
 * @param options.skipLocalization If true, skips blocking API calls for localization (Nominatim). faster but less accurate names.
 */
export async function detectLocationFromHeaders(
    locale: string = 'ko',
    options: { skipLocalization?: boolean } = { skipLocalization: true }
): Promise<MoodcastLocation> {
    const headerStore = await headers();

    // 1. Get Client IP
    let ip = headerStore.get('x-forwarded-for') || '127.0.0.1';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();

    let initialCity = 'Unknown';
    let initialSubdivision = 'Unknown';
    let initialCountryCode = 'Unknown';
    let timezone = 'Asia/Seoul';
    let maxmindNominatimQuery: string | undefined = undefined;

    // Standard Names (Fallback)
    let cityEn = 'Unknown';
    let countryEn = 'Unknown';
    let region2En = 'Unknown';

    // 2. Try MaxMind GeoIP
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const geoResult = await lookupIP(ip, locale);
        if (geoResult) {
            initialCity = geoResult.city || 'Unknown';
            initialSubdivision = geoResult.subdivision || 'Unknown';
            initialCountryCode = geoResult.countryCode || 'Unknown';
            timezone = geoResult.timezone || 'Asia/Seoul';
            maxmindNominatimQuery = geoResult.nominatimQuery;

            // Handle Hierarchical Region Countries (e.g. KR, JP) for immediate result
            const code = geoResult.countryCode || '';
            if (USE_SUBDIVISION_AS_REGION1.includes(code) && geoResult.subdivision) {
                cityEn = geoResult.std.subdivision || geoResult.std.city;
                region2En = geoResult.std.city;
            } else {
                cityEn = geoResult.std.city;
                region2En = 'Unknown';
            }
            countryEn = geoResult.std.country;
        }
    }

    // 2.1 Use Intl.DisplayNames for instant country localization (No API call needed)
    if (initialCountryCode !== 'Unknown') {
        try {
            const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
            const localizedCountry = regionNames.of(initialCountryCode);
            if (localizedCountry && localizedCountry !== initialCountryCode) {
                // Update initialCountryCode (which feeds into region0 fallback)
                // Note: We are overwriting the CODE with the LOCALIZED NAME.
                // ideally region0 should be Name, region0_std should be Code/En Name.
                // existing logic puts initialCountryCode into region0.
                initialCountryCode = localizedCountry;
            }
        } catch (e) {
            // Ignore Intl error
        }
    }

    // 3. Fallback to Vercel Headers
    if (initialCity === 'Unknown') {
        const vCity = headerStore.get('x-vercel-ip-city') || headerStore.get('cf-ipcity');
        const vCountry = headerStore.get('x-vercel-ip-country') || headerStore.get('cf-ipcountry');
        const vTz = headerStore.get('x-vercel-ip-timezone') || headerStore.get('cf-timezone');

        if (vCity) {
            initialCity = vCity;
            cityEn = vCity;
        }
        if (vCountry) {
            initialCountryCode = vCountry;
            countryEn = vCountry;

            // Try Intl localization for Vercel country code as well
            try {
                const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
                const localizedCountry = regionNames.of(vCountry);
                if (localizedCountry) initialCountryCode = localizedCountry;
            } catch (e) { }
        }
        if (vTz) timezone = vTz;
    }

    // Baseline Result (IP-only / V1 style)
    const baselineResult: MoodcastLocation = {
        region0: initialCountryCode,
        region1: initialCity,
        region2: 'Unknown',
        timezone,
        std: {
            region0: countryEn,
            region1: cityEn,
            region2: region2En
        }
    };

    // 4. Nominatim Enrichment (V2 Logic)
    // Only proceed if skipLocalization is FALSE and we have a city
    if (!options.skipLocalization && initialCity !== 'Unknown') {
        try {
            let query = maxmindNominatimQuery;
            if (!query) {
                const parts = [initialCity];
                if (initialSubdivision !== 'Unknown') parts.push(initialSubdivision);
                if (initialCountryCode !== 'Unknown') parts.push(initialCountryCode);
                query = parts.join(', ');
            }

            const [addressEncoded, addressEn] = await Promise.all([
                fetchGeocodeRaw(query, locale),
                fetchGeocodeRaw(query, 'en')
            ]);

            if (addressEncoded) {
                const mapped = mapNominatimAddress(addressEncoded);

                // Granularity Check (Filter center-point artifacts)
                const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
                const foundNorm = normalize(addressEncoded.name || '');
                const region1Norm = normalize(mapped.region1 || '');

                if (foundNorm && region1Norm && (foundNorm === region1Norm || foundNorm.startsWith(region1Norm))) {
                    mapped.region2 = 'Unknown';
                }

                baselineResult.region0 = mapped.region0 || baselineResult.region0;
                baselineResult.region1 = mapped.region1 || baselineResult.region1;
                baselineResult.region2 = mapped.region2 || baselineResult.region2;
            }

            if (addressEn) {
                const mappedStd = mapNominatimAddress(addressEn);
                // Similar Granularity check for Std? Usually English names are consistent.
                baselineResult.std = {
                    region0: mappedStd.region0 || baselineResult.std.region0,
                    region1: mappedStd.region1 || baselineResult.std.region1,
                    region2: mappedStd.region2 || baselineResult.std.region2
                };
            }
        } catch (e) {
            console.error("Nominatim Enrichment Failed:", e);
        }
    }

    // Final Post-processing: Ensure Region1 is at least Country if city missing
    if (baselineResult.region1 === 'Unknown') baselineResult.region1 = baselineResult.region0;
    if (baselineResult.std.region1 === 'Unknown') baselineResult.std.region1 = baselineResult.std.region0;

    return baselineResult;
}
