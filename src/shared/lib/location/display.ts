/**
 * Utility for formatting and displaying location names effectively.
 * Enforces the business logic:
 * - Prefer Region Lv2 (District/Borough) if available.
 * - Fallback to Region Lv1 (City) if Lv2 is Unknown or missing.
 * - Fallback to Region Lv0 (Country) if Lv1 is Unknown or missing.
 */

export interface MoodcastDisplayLocation {
    region_lv0?: string | null;
    region_lv1?: string | null;
    region_lv2?: string | null;
}

export function getLocationDisplayName(location: MoodcastDisplayLocation, defaultText: string = 'Unknown'): string {
    const r2 = location.region_lv2;
    const r1 = location.region_lv1;
    const r0 = location.region_lv0;

    // Strict check for "Unknown" string as well as null/undefined
    const isValid = (val?: string | null) => val && val !== 'Unknown' && val.trim() !== '';

    if (isValid(r2)) return r2!;
    if (isValid(r1)) return r1!;
    if (isValid(r0)) return r0!;

    return defaultText;
}

/**
 * Returns the best available "Scope" for the location.
 * Used for determining which dashboard stats to fetch.
 */
export function getLocationScope(location: MoodcastDisplayLocation): 'lv2' | 'lv1' | 'lv0' | 'global' {
    const isValid = (val?: string | null) => val && val !== 'Unknown' && val.trim() !== '';

    if (isValid(location.region_lv2)) return 'lv2';
    if (isValid(location.region_lv1)) return 'lv1';
    if (isValid(location.region_lv0)) return 'lv0';
    return 'global';
}
