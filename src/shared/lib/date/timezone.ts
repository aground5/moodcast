export function getStartOfDayUTC(timezone: string = 'UTC'): string {
    // 1. Get current time
    const now = new Date();

    // 2. Format to parts in the target timezone to find "local parts"
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour12: false
    });

    const parts = formatter.formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1970');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1');
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');

    // 3. Create a Date object that REPRESENTS that local midnight.
    // We want to find the UTC timestamp that corresponds to "YYYY-MM-DD 00:00:00" in the target timezone.

    // We can use a trick: Create a string "YYYY-MM-DD 00:00:00" and parse it *as if* it is in that timezone?
    // Browsers/Node don't easily support "Parse Date String as Arbitrary Timezone" without libraries.

    // Alternative approach:
    // Create a date in UTC that is close to the expected time, then adjust?
    // Or robust approach: Use `toLocaleString` to find offset?

    // Let's use the explicit conversion of "YYYY-MM-DDT00:00:00" string IF we assume we are just checking against DB.
    // BUT DB `created_at` is UTC.
    // So we need [Target TZ Midnight] -> [UTC Timestamp].

    // Let's brute force it slightly or use the `Date` constructor if we can trust the environment to have full ICU data (Node 18+ usually does).

    // Construct string "MM/DD/YYYY, 00:00:00"
    const localMidnightString = `${month}/${day}/${year}, 00:00:00`;

    // Create date object assuming we can parse it in that timezone context... 
    // Actually `new Date(string)` uses LOCAL system timezone. Not target.

    // Library-free Solution:
    // 1. Create a UTC date for "Midnight UTC".
    // 2. Check what time that is in Target TZ.
    // 3. Adjust diff.

    // Easier:
    // "2025-01-01T00:00:00" -> treat as Target TZ -> Convert to UTC epoch.

    // We can use `toLocaleString` to iterativly find the timestamp, but that's slow.
    // Given this is a "Core" bug without libraries like `date-fns-tz`, let's try a best-effort simple offset calculation if possible, OR just assume Vercel headers give us the offset too? No, usually just IANA name.

    // Hacky but robust enough for Node:
    // 1. Create a date at UTC Midnight.
    // 2. Get the offset of that Timezone at that specific time.

    const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

    // Get the formatted string of this UTC time in the TARGET timezone
    // e.g. "12/28/2025, 09:00:00 AM" (if offset is +9)
    // Compare and shift.

    // Better: use `Intl.DateTimeFormat` to get the offset?
    // Node doesn't expose `formatToParts` with type="timeZoneName" giving offset easily in all versions.

    // Let's rely on string manipulation which works reliably in modern Node.
    // Function: "Returns the ISO String (UTC) corresponding to Midnight in the given Timezone"

    // Create a date that we *think* might be midnight.
    // Adjust until it parses as 00:00 in the target timezone.

    // Actually, just install `date-fns-tz`? 
    // User wants "Global" solution. Libraries are safer.
    // But I'll try to stick to standard lib if possible to avoid huge deps if not needed.
    // Let's implement a simple binary search or offset check.

    // 1. Take `now`.
    // 2. Get the offset in minutes for `timezone`.
    //    `now` string in TZ vs `now` string in UTC.

    const tzDateString = now.toLocaleString('en-US', { timeZone: timezone, hour12: false }); // "12/28/2025, 04:22:30"
    const utcDateString = now.toLocaleString('en-US', { timeZone: 'UTC', hour12: false }); // "12/27/2025, 19:22:30"

    const tzDate = new Date(tzDateString);
    const utcDate = new Date(utcDateString);

    const offsetMs = tzDate.getTime() - utcDate.getTime(); // This is roughly the offset (ignoring minor parsing diffs if format matches)

    // Now we want "Midnight in TZ". 
    // That means `Local Time = YYYY-MM-DD 00:00:00`.
    // `UTC Time = Local Time - Offset`.

    const targetLocalMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const targetUtcTimestamp = targetLocalMidnight.getTime() - offsetMs;

    return new Date(targetUtcTimestamp).toISOString();
}
