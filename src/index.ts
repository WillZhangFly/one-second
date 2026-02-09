/**
 * one-second - Ultra-lightweight date library using native Intl API
 * Zero dependencies, tree-shakeable, immutable
 */

// Types
export type {
  DateInput,
  FormatOptions,
  RelativeTimeOptions,
  Unit,
  Duration,
  BusinessDayOptions,
  Interval,
} from './types.js';

// Core
export { toDate, isValid, clone, now } from './core.js';

// Formatting
export {
  format,
  formatStr,
  toISO,
  toTime,
  toISOString,
  parse,
  formatDate,
  formatDateTime,
  formatTime,
} from './format.js';

// Relative time
export { relative, timeAgo } from './relative.js';

// Arithmetic
export {
  add,
  subtract,
  addYears,
  addMonths,
  addWeeks,
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  subYears,
  subMonths,
  subWeeks,
  subDays,
  subHours,
  subMinutes,
  subSeconds,
} from './arithmetic.js';

// Comparisons
export {
  isSameDay,
  isSameMonth,
  isSameYear,
  isBefore,
  isAfter,
  isBetween,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  isWeekend,
  isWeekday,
} from './compare.js';

// Difference
export {
  diff,
  diffInYears,
  diffInMonths,
  diffInWeeks,
  diffInDays,
  diffInHours,
  diffInMinutes,
  diffInSeconds,
} from './diff.js';

// Getters
export {
  getYear,
  getMonth,
  getDate,
  getDay,
  getHours,
  getMinutes,
  getSeconds,
  getMilliseconds,
  getTime,
  dayName,
  monthName,
} from './getters.js';

// Period boundaries
export { startOf, endOf, today } from './period.js';

// Utilities
export {
  daysInMonth,
  isLeapYear,
  dayOfYear,
  weekOfYear,
  quarter,
  create,
  min,
  max,
} from './utils.js';

// Duration
export { duration, durationBetween } from './duration.js';

// Timezone
export {
  utc,
  utcOffset,
  formatInTz,
  formatStrInTz,
  getTimezoneAbbr,
  getTimezoneName,
  getTimezoneOffsetStr,
  tzOffset,
  toTimezone,
  guessTimezone,
  isValidTimezone,
  listTimezones,
  nowInTz,
  sameInstant,
  TIMEZONES,
} from './timezone.js';
export type { TimezoneId } from './timezone.js';

// Business days
export {
  isBusinessDay,
  nextBusinessDay,
  prevBusinessDay,
  addBusinessDays,
  subBusinessDays,
  diffInBusinessDays,
} from './business.js';

// Intervals
export {
  interval,
  areIntervalsOverlapping,
  isWithinInterval,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from './interval.js';

// Chainable wrapper
export { d } from './wrapper.js';
export type { DateWrapper } from './wrapper.js';
