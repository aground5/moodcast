import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay } from 'date-fns';

export function getStartOfDayUTC(timezone: string = 'UTC'): string {
    const now = new Date();

    // 1. Convert current UTC time to the target timezone's "Wall Time"
    const zonedDate = toZonedTime(now, timezone);

    // 2. Get the Start of Day (00:00:00) of that Wall Time
    const zonedStartOfDay = startOfDay(zonedDate);

    // 3. Convert that Wall Time back to a UTC Date object
    const utcStartOfDay = fromZonedTime(zonedStartOfDay, timezone);

    return utcStartOfDay.toISOString();
}
