# one-second

> Ultra-lightweight date library using native Intl API - 2KB, zero dependencies, immutable

[![npm version](https://img.shields.io/npm/v/one-second.svg)](https://www.npmjs.com/package/one-second)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why one-second?

- **Tiny**: ~3KB minified (vs Moment.js 300KB, Luxon 29KB, Day.js 6KB)
- **Zero dependencies**: Uses native `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat`
- **Immutable**: All operations return new Date objects
- **Tree-shakeable**: Import only what you need
- **TypeScript**: Full type definitions included
- **Fast**: Caches formatters for optimal performance

## Installation

```bash
npm install one-second
```

## Quick Start

```typescript
import { format, relative, addDays, isToday } from 'one-second';

// Format dates using native Intl
format(new Date(), { month: 'long', day: 'numeric', year: 'numeric' });
// → "January 15, 2024"

// Relative time
relative(new Date(Date.now() - 3600000)); // 1 hour ago
// → "1 hour ago"

// Date arithmetic (immutable)
const tomorrow = addDays(new Date(), 1);

// Comparisons
isToday(new Date()); // → true
```

## Comparison with Alternatives

| Feature | one-second | Day.js | date-fns | Luxon | Moment.js |
|---------|-----------|--------|----------|-------|-----------|
| Size (gzip) | **~3KB** | 6KB | 18KB+ | 29KB | 72KB+ |
| Dependencies | **0** | 0 | 0 | 0 | 0 |
| Immutable | **Yes** | Yes | Yes | Yes | No |
| Tree-shakeable | **Yes** | Plugin | Yes | Partial | No |
| Native Intl | **Yes** | Partial | Partial | Yes | No |
| i18n (built-in) | **Yes** | Plugin | Yes | Yes | Plugin |
| Timezone | **Yes** | Plugin | Yes | Yes | Plugin |
| Format strings | **Yes** | Yes | No | No | Yes |
| Parse w/ format | **Yes** | Plugin | Yes | No | Yes |
| Duration | **Yes** | Plugin | Yes | Yes | Yes |
| TypeScript | **Yes** | Yes | Yes | Yes | @types |
| Zero config | **Yes** | Yes | Yes | Yes | Yes |

## API Reference

### Parsing

```typescript
import { toDate, isValid, parse } from 'one-second';

toDate('2024-01-15');        // Date from string
toDate(1705276800000);       // Date from timestamp
toDate(new Date());          // Clone date

isValid('2024-01-15');       // true
isValid('invalid');          // false

// Parse with custom format (like dayjs/moment)
parse('2024-06-15', 'YYYY-MM-DD');           // Date
parse('15/06/2024', 'DD/MM/YYYY');           // Date
parse('2024-06-15 14:30', 'YYYY-MM-DD HH:mm'); // Date with time
```

### Formatting

```typescript
import { format, formatStr, formatDate, formatDateTime, toISO, toTime } from 'one-second';

// Format with template string (like dayjs/moment)
formatStr(date, 'YYYY-MM-DD');           // "2024-01-15"
formatStr(date, 'DD/MM/YYYY HH:mm');     // "15/01/2024 10:30"
formatStr(date, 'MMMM D, YYYY');         // "January 15, 2024"
formatStr(date, 'ddd, MMM D');           // "Mon, Jan 15"
formatStr(date, 'hh:mm A');              // "10:30 AM"

// Supported tokens: YYYY, YY, MMMM, MMM, MM, M, DD, D, dddd, ddd,
//                   HH, H, hh, h, mm, m, ss, s, SSS, A, a

// Custom format using Intl options
format(date, {
  locale: 'en-US',
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
// → "Monday, January 15, 2024"

// Preset formats
formatDate(date);            // "Jan 15, 2024"
formatDateTime(date);        // "Jan 15, 2024, 10:30 AM"
formatTime(date);            // "10:30 AM"

// ISO formats
toISO(date);                 // "2024-01-15"
toTime(date);                // "10:30:00"
toISOString(date);           // "2024-01-15T10:30:00.000Z"
```

### Relative Time

```typescript
import { relative, timeAgo } from 'one-second';

relative(new Date(Date.now() - 60000));      // "1 minute ago"
relative(new Date(Date.now() + 86400000));   // "in 1 day"

// With locale
relative(date, { locale: 'es' });            // "hace 1 minuto"
relative(date, { locale: 'zh' });            // "1 分钟前"

// Short style
relative(date, { style: 'short' });          // "1 min. ago"

// Convenience function
timeAgo(date);                               // "2 hours ago"
```

### Date Arithmetic

All operations are **immutable** - they return a new Date.

```typescript
import { add, subtract, addDays, addMonths, subWeeks } from 'one-second';

// Generic add/subtract
add(date, 5, 'day');
subtract(date, 2, 'hour');

// Convenience functions
addDays(date, 7);
addMonths(date, 1);
addYears(date, 1);
addHours(date, 3);
addMinutes(date, 30);

subDays(date, 7);
subMonths(date, 1);
subWeeks(date, 2);
```

### Comparisons

```typescript
import {
  isBefore, isAfter, isBetween,
  isSameDay, isSameMonth, isSameYear,
  isToday, isYesterday, isTomorrow,
  isPast, isFuture
} from 'one-second';

isBefore(date1, date2);      // true/false
isAfter(date1, date2);       // true/false
isBetween(date, start, end); // true/false

isSameDay(date1, date2);     // true/false
isSameMonth(date1, date2);   // true/false
isSameYear(date1, date2);    // true/false

isToday(date);               // true/false
isYesterday(date);           // true/false
isTomorrow(date);            // true/false

isPast(date);                // true/false
isFuture(date);              // true/false
```

### Difference

```typescript
import { diff, diffInDays, diffInHours, diffInMinutes } from 'one-second';

// Generic diff
diff(date1, date2, 'day');
diff(date1, date2, 'hour');

// Convenience functions
diffInDays(date1, date2);
diffInHours(date1, date2);
diffInMinutes(date1, date2);
diffInMonths(date1, date2);
diffInYears(date1, date2);
```

### Start/End of Period

```typescript
import { startOf, endOf } from 'one-second';

startOf(date, 'day');        // Start of day (00:00:00)
startOf(date, 'month');      // First day of month
startOf(date, 'year');       // January 1st
startOf(date, 'week');       // Sunday of the week

endOf(date, 'day');          // End of day (23:59:59.999)
endOf(date, 'month');        // Last day of month
endOf(date, 'year');         // December 31st
```

### Getters

```typescript
import {
  getYear, getMonth, getDate, getDay,
  getHours, getMinutes, getSeconds, getTime
} from 'one-second';

getYear(date);               // 2024
getMonth(date);              // 0-11 (January = 0)
getDate(date);               // 1-31
getDay(date);                // 0-6 (Sunday = 0)
getHours(date);              // 0-23
getMinutes(date);            // 0-59
getSeconds(date);            // 0-59
getTime(date);               // Unix timestamp
```

### Duration

```typescript
import { duration, durationBetween } from 'one-second';

// Create duration from milliseconds
const dur = duration(3661000);  // 1 hour, 1 min, 1 sec
dur.hours;                      // 1
dur.minutes;                    // 1
dur.seconds;                    // 1

// Create duration from unit
const week = duration(1, 'week');
week.asDays();                  // 7

// Duration between dates
const diff = durationBetween(date1, date2);
diff.humanize();                // "2 days"

// Convert to different units
dur.asMilliseconds();           // 3661000
dur.asSeconds();                // 3661
dur.asMinutes();                // 61.01...
dur.asHours();                  // 1.01...
dur.asDays();                   // 0.04...
```

### Utilities

```typescript
import {
  daysInMonth, isLeapYear, dayOfYear, weekOfYear, quarter,
  create, now, today, clone, min, max,
  isWeekend, isWeekday, dayName, monthName
} from 'one-second';

daysInMonth(date);           // 28, 29, 30, or 31
isLeapYear(date);            // true/false
dayOfYear(date);             // 1-366
weekOfYear(date);            // 1-53
quarter(date);               // 1-4

create(2024, 0, 15);         // January 15, 2024
now();                       // Current timestamp
today();                     // Start of today
clone(date);                 // Clone a date

min(date1, date2, date3);    // Earliest date
max(date1, date2, date3);    // Latest date

isWeekend(date);             // true if Sat/Sun
isWeekday(date);             // true if Mon-Fri
dayName(date);               // "Monday"
monthName(date);             // "January"
```

## Timezone Support

Built-in timezone support using native `Intl` - no moment-timezone needed!

```typescript
import {
  formatInTz, formatStrInTz, toTimezone,
  getTimezoneAbbr, getTimezoneName, tzOffset,
  guessTimezone, isValidTimezone, listTimezones,
  TIMEZONES
} from 'one-second';

// Format in specific timezone
formatInTz(new Date(), 'America/New_York', { dateStyle: 'full', timeStyle: 'long' });
// → "Wednesday, February 5, 2025 at 11:30:00 AM EST"

// Format with template in timezone
formatStrInTz(new Date(), 'YYYY-MM-DD HH:mm z', 'Asia/Tokyo');
// → "2025-02-06 01:30 JST"

// Get timezone info
getTimezoneAbbr(new Date(), 'America/Los_Angeles');  // "PST"
getTimezoneName(new Date(), 'Europe/Paris');         // "Central European Standard Time"
getTimezoneOffsetStr(new Date(), 'Asia/Shanghai');   // "+08:00"

// Get date parts in timezone
const tokyo = toTimezone(new Date(), 'Asia/Tokyo');
// { year: 2025, month: 1, day: 6, hours: 1, minutes: 30, ... }

// Get offset in minutes
tzOffset(new Date(), 'America/New_York');  // -300 (EST = UTC-5)

// Detect user's timezone
guessTimezone();  // "America/Los_Angeles"

// Validate timezone
isValidTimezone('America/New_York');  // true
isValidTimezone('Invalid/Zone');      // false

// List all common timezones with current offsets
listTimezones();
// [
//   { id: 'Pacific/Honolulu', name: 'Honolulu', abbr: 'HST', offset: '-10:00' },
//   { id: 'America/Los_Angeles', name: 'Pacific Time (US)', abbr: 'PST', offset: '-08:00' },
//   ...
// ]

// Common timezone constants
TIMEZONES['America/New_York'];  // "Eastern Time (US)"
TIMEZONES['Asia/Tokyo'];        // "Tokyo"
```

### Timezone Tokens

When using `formatStrInTz`, additional tokens are available:

| Token | Output | Example |
|-------|--------|---------|
| `z` | Timezone abbreviation | PST, EST, JST |
| `Z` | Timezone offset | +08:00, -05:00 |

```typescript
formatStrInTz(date, 'HH:mm z (Z)', 'America/New_York');
// → "14:30 EST (-05:00)"
```

## Internationalization

one-second uses native `Intl` APIs, so all locales supported by your environment work automatically:

```typescript
import { format, relative } from 'one-second';

// Format in different locales
format(date, { locale: 'ja-JP', dateStyle: 'full' });
// → "2024年1月15日月曜日"

format(date, { locale: 'de-DE', dateStyle: 'long' });
// → "15. Januar 2024"

// Relative time in different locales
relative(date, { locale: 'fr' });  // "il y a 2 heures"
relative(date, { locale: 'ko' });  // "2시간 전"
```

**No locale files needed!** Intl uses the operating system's locale data.

## Performance

one-second caches `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` instances for optimal performance:

```typescript
// Formatting 1000 dates:
// toLocaleDateString(): ~217ms (creates new formatter each time)
// one-second format():   ~4ms (reuses cached formatter)
```

## Migration from Moment.js

```typescript
// Moment.js                          // one-second
moment()                              // new Date()
moment('2024-01-15')                  // toDate('2024-01-15')
moment().format('YYYY-MM-DD')         // toISO(new Date())
moment().add(7, 'days')               // addDays(new Date(), 7)
moment().subtract(1, 'month')         // subMonths(new Date(), 1)
moment().fromNow()                    // timeAgo(new Date())
moment().isBefore(other)              // isBefore(date, other)
moment().startOf('day')               // startOf(date, 'day')
moment().diff(other, 'days')          // diffInDays(date, other)
```

## Migration from Day.js

```typescript
// Day.js                             // one-second
dayjs()                               // new Date()
dayjs().format('YYYY-MM-DD')          // toISO(new Date())
dayjs().add(7, 'day')                 // addDays(new Date(), 7)
dayjs().fromNow()                     // timeAgo(new Date())
dayjs().isBefore(other)               // isBefore(date, other)
```

## Browser Support

Works in all modern browsers and Node.js 18+. Uses:
- `Intl.DateTimeFormat` (96%+ browser support)
- `Intl.RelativeTimeFormat` (94%+ browser support)

## Support

This project is maintained in my free time. If it saved you some kilobytes and made your dates easier to handle, I'd really appreciate your support:

- ⭐ Star the repo—it helps others discover this tool
- 📢 Share with your team or on social media
- 🐛 [Report bugs or suggest features](https://github.com/willzhangfly/one-second/issues)
- ☕ [Buy me a coffee](https://buymeacoffee.com/willzhangfly) if you'd like to support development

Thank you to everyone who has contributed, shared feedback, or helped spread the word!

## License

MIT

---

**Made with care for smaller bundles and simpler dates**
