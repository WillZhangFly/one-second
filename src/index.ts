/**
 * date-lite - Ultra-lightweight date library using native Intl API
 * Zero dependencies, ~2KB, immutable, tree-shakeable
 */

// ============================================
// Types
// ============================================

export type DateInput = Date | string | number;

export interface FormatOptions {
  locale?: string;
  weekday?: 'long' | 'short' | 'narrow';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
  timeZone?: string;
}

export interface RelativeTimeOptions {
  locale?: string;
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
}

export type Unit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';

// ============================================
// Core: Parse to Date
// ============================================

/**
 * Convert any input to a Date object
 */
export function toDate(input: DateInput): Date {
  if (input instanceof Date) return new Date(input.getTime());
  if (typeof input === 'number') return new Date(input);
  return new Date(input);
}

/**
 * Check if input is a valid date
 */
export function isValid(input: DateInput): boolean {
  const d = toDate(input);
  return !isNaN(d.getTime());
}

// ============================================
// Formatting (using native Intl)
// ============================================

// Cache formatters for performance
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(options: FormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  let formatter = formatterCache.get(key);
  if (!formatter) {
    const { locale, ...opts } = options;
    formatter = new Intl.DateTimeFormat(locale, opts);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

/**
 * Format date using Intl.DateTimeFormat
 */
export function format(input: DateInput, options: FormatOptions = {}): string {
  return getFormatter(options).format(toDate(input));
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function toISO(input: DateInput): string {
  const d = toDate(input);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time to HH:MM:SS
 */
export function toTime(input: DateInput): string {
  const d = toDate(input);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format to full ISO datetime string
 */
export function toISOString(input: DateInput): string {
  return toDate(input).toISOString();
}

/**
 * Format date using format string (like dayjs/moment)
 * Tokens: YYYY, YY, MM, M, DD, D, HH, H, mm, m, ss, s, SSS, ddd, dddd, MMM, MMMM, A, a
 */
export function formatStr(input: DateInput, template: string, locale = 'en-US'): string {
  const d = toDate(input);

  const year = d.getFullYear();
  const month = d.getMonth();
  const date = d.getDate();
  const day = d.getDay();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ms = d.getMilliseconds();

  // Get localized names using Intl
  const monthLong = new Intl.DateTimeFormat(locale, { month: 'long' }).format(d);
  const monthShort = new Intl.DateTimeFormat(locale, { month: 'short' }).format(d);
  const dayLong = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d);
  const dayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d);

  const pad = (n: number, len = 2) => String(n).padStart(len, '0');

  const tokens: Record<string, string> = {
    'YYYY': String(year),
    'YY': String(year).slice(-2),
    'MMMM': monthLong,
    'MMM': monthShort,
    'MM': pad(month + 1),
    'M': String(month + 1),
    'DD': pad(date),
    'D': String(date),
    'dddd': dayLong,
    'ddd': dayShort,
    'HH': pad(hours),
    'H': String(hours),
    'hh': pad(hours % 12 || 12),
    'h': String(hours % 12 || 12),
    'mm': pad(minutes),
    'm': String(minutes),
    'ss': pad(seconds),
    's': String(seconds),
    'SSS': pad(ms, 3),
    'A': hours < 12 ? 'AM' : 'PM',
    'a': hours < 12 ? 'am' : 'pm',
  };

  // Sort by length (longest first) to match MMMM before MMM before MM before M
  const pattern = Object.keys(tokens)
    .sort((a, b) => b.length - a.length)
    .join('|');

  return template.replace(new RegExp(pattern, 'g'), match => tokens[match] || match);
}

/**
 * Parse date from string with format
 * Tokens: YYYY, MM, DD, HH, mm, ss
 */
export function parse(dateStr: string, template: string): Date {
  const tokenDefs: Array<{ token: string; regex: string; field: string; transform?: (v: number) => number }> = [
    { token: 'YYYY', regex: '(\\d{4})', field: 'year' },
    { token: 'YY', regex: '(\\d{2})', field: 'year', transform: (v) => 2000 + v },
    { token: 'MM', regex: '(\\d{2})', field: 'month', transform: (v) => v - 1 },
    { token: 'M', regex: '(\\d{1,2})', field: 'month', transform: (v) => v - 1 },
    { token: 'DD', regex: '(\\d{2})', field: 'day' },
    { token: 'D', regex: '(\\d{1,2})', field: 'day' },
    { token: 'HH', regex: '(\\d{2})', field: 'hour' },
    { token: 'H', regex: '(\\d{1,2})', field: 'hour' },
    { token: 'mm', regex: '(\\d{2})', field: 'minute' },
    { token: 'm', regex: '(\\d{1,2})', field: 'minute' },
    { token: 'ss', regex: '(\\d{2})', field: 'second' },
    { token: 's', regex: '(\\d{1,2})', field: 'second' },
    { token: 'SSS', regex: '(\\d{3})', field: 'ms' },
  ];

  // Sort by token length (longest first) to avoid partial matches
  const sortedDefs = [...tokenDefs].sort((a, b) => b.token.length - a.token.length);

  // Find which tokens are in the template and their positions
  const foundTokens: Array<{ pos: number; def: typeof tokenDefs[0] }> = [];
  let searchTemplate = template;

  for (const def of sortedDefs) {
    let pos = searchTemplate.indexOf(def.token);
    while (pos !== -1) {
      foundTokens.push({ pos, def });
      // Replace with placeholder to avoid double-matching
      searchTemplate = searchTemplate.substring(0, pos) + '\x00'.repeat(def.token.length) + searchTemplate.substring(pos + def.token.length);
      pos = searchTemplate.indexOf(def.token);
    }
  }

  // Sort by position
  foundTokens.sort((a, b) => a.pos - b.pos);

  // Build regex pattern
  let pattern = template;
  // Escape special regex chars first
  pattern = pattern.replace(/[.*+?^${}|[\]\\]/g, '\\$&');

  // Replace tokens with their regex patterns (in reverse order to maintain positions)
  for (const { def } of [...foundTokens].reverse().sort((a, b) => b.pos - a.pos)) {
    const escaped = def.token.replace(/[.*+?^${}|[\]\\]/g, '\\$&');
    pattern = pattern.replace(escaped, def.regex);
  }

  const regex = new RegExp('^' + pattern + '$');
  const match = dateStr.match(regex);

  if (!match) {
    return new Date(NaN);
  }

  const parts: Record<string, number> = {
    year: new Date().getFullYear(),
    month: 0,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    ms: 0,
  };

  // Apply matches in order
  for (let i = 0; i < foundTokens.length; i++) {
    const { def } = foundTokens[i];
    let value = parseInt(match[i + 1], 10);
    if (def.transform) {
      value = def.transform(value);
    }
    parts[def.field] = value;
  }

  return new Date(parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second, parts.ms);
}

// Preset formats
export function formatDate(input: DateInput, locale = 'en-US'): string {
  return format(input, { locale, year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(input: DateInput, locale = 'en-US'): string {
  return format(input, {
    locale,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(input: DateInput, locale = 'en-US'): string {
  return format(input, { locale, hour: '2-digit', minute: '2-digit' });
}

// ============================================
// Relative Time (using native Intl.RelativeTimeFormat)
// ============================================

const rtfCache = new Map<string, Intl.RelativeTimeFormat>();

function getRelativeFormatter(options: RelativeTimeOptions): Intl.RelativeTimeFormat {
  const key = JSON.stringify(options);
  let formatter = rtfCache.get(key);
  if (!formatter) {
    const { locale = 'en', ...opts } = options;
    formatter = new Intl.RelativeTimeFormat(locale, opts);
    rtfCache.set(key, formatter);
  }
  return formatter;
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function relative(input: DateInput, options: RelativeTimeOptions = {}): string {
  const d = toDate(input);
  const now = Date.now();
  const diffMs = d.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  const rtf = getRelativeFormatter({ numeric: 'auto', ...options });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffDay) < 7) return rtf.format(diffDay, 'day');
  if (Math.abs(diffWeek) < 4) return rtf.format(diffWeek, 'week');
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, 'month');
  return rtf.format(diffYear, 'year');
}

/**
 * Get human-readable time ago string
 */
export function timeAgo(input: DateInput, locale = 'en'): string {
  return relative(input, { locale, numeric: 'auto' });
}

// ============================================
// Date Arithmetic (immutable - returns new Date)
// ============================================

/**
 * Add time to a date (returns new Date)
 */
export function add(input: DateInput, amount: number, unit: Unit): Date {
  const d = toDate(input);

  switch (unit) {
    case 'year':
      return new Date(d.getFullYear() + amount, d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
    case 'month':
      return new Date(d.getFullYear(), d.getMonth() + amount, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
    case 'week':
      return new Date(d.getTime() + amount * 7 * 24 * 60 * 60 * 1000);
    case 'day':
      return new Date(d.getTime() + amount * 24 * 60 * 60 * 1000);
    case 'hour':
      return new Date(d.getTime() + amount * 60 * 60 * 1000);
    case 'minute':
      return new Date(d.getTime() + amount * 60 * 1000);
    case 'second':
      return new Date(d.getTime() + amount * 1000);
    case 'millisecond':
      return new Date(d.getTime() + amount);
    default:
      return d;
  }
}

/**
 * Subtract time from a date (returns new Date)
 */
export function subtract(input: DateInput, amount: number, unit: Unit): Date {
  return add(input, -amount, unit);
}

// Convenience methods
export const addYears = (input: DateInput, n: number) => add(input, n, 'year');
export const addMonths = (input: DateInput, n: number) => add(input, n, 'month');
export const addWeeks = (input: DateInput, n: number) => add(input, n, 'week');
export const addDays = (input: DateInput, n: number) => add(input, n, 'day');
export const addHours = (input: DateInput, n: number) => add(input, n, 'hour');
export const addMinutes = (input: DateInput, n: number) => add(input, n, 'minute');
export const addSeconds = (input: DateInput, n: number) => add(input, n, 'second');

export const subYears = (input: DateInput, n: number) => subtract(input, n, 'year');
export const subMonths = (input: DateInput, n: number) => subtract(input, n, 'month');
export const subWeeks = (input: DateInput, n: number) => subtract(input, n, 'week');
export const subDays = (input: DateInput, n: number) => subtract(input, n, 'day');
export const subHours = (input: DateInput, n: number) => subtract(input, n, 'hour');
export const subMinutes = (input: DateInput, n: number) => subtract(input, n, 'minute');
export const subSeconds = (input: DateInput, n: number) => subtract(input, n, 'second');

// ============================================
// Comparisons
// ============================================

/**
 * Check if two dates are the same day
 */
export function isSameDay(a: DateInput, b: DateInput): boolean {
  const d1 = toDate(a);
  const d2 = toDate(b);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Check if two dates are the same month
 */
export function isSameMonth(a: DateInput, b: DateInput): boolean {
  const d1 = toDate(a);
  const d2 = toDate(b);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth();
}

/**
 * Check if two dates are the same year
 */
export function isSameYear(a: DateInput, b: DateInput): boolean {
  return toDate(a).getFullYear() === toDate(b).getFullYear();
}

/**
 * Check if date is before another
 */
export function isBefore(a: DateInput, b: DateInput): boolean {
  return toDate(a).getTime() < toDate(b).getTime();
}

/**
 * Check if date is after another
 */
export function isAfter(a: DateInput, b: DateInput): boolean {
  return toDate(a).getTime() > toDate(b).getTime();
}

/**
 * Check if date is between two dates
 */
export function isBetween(input: DateInput, start: DateInput, end: DateInput): boolean {
  const t = toDate(input).getTime();
  return t >= toDate(start).getTime() && t <= toDate(end).getTime();
}

/**
 * Check if date is today
 */
export function isToday(input: DateInput): boolean {
  return isSameDay(input, new Date());
}

/**
 * Check if date is yesterday
 */
export function isYesterday(input: DateInput): boolean {
  return isSameDay(input, subDays(new Date(), 1));
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(input: DateInput): boolean {
  return isSameDay(input, addDays(new Date(), 1));
}

/**
 * Check if date is in the past
 */
export function isPast(input: DateInput): boolean {
  return toDate(input).getTime() < Date.now();
}

/**
 * Check if date is in the future
 */
export function isFuture(input: DateInput): boolean {
  return toDate(input).getTime() > Date.now();
}

// ============================================
// Difference
// ============================================

/**
 * Get difference between two dates in specified unit
 */
export function diff(a: DateInput, b: DateInput, unit: Unit): number {
  const d1 = toDate(a);
  const d2 = toDate(b);
  const diffMs = d1.getTime() - d2.getTime();

  switch (unit) {
    case 'year':
      return d1.getFullYear() - d2.getFullYear();
    case 'month':
      return (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
    case 'week':
      return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    case 'day':
      return Math.floor(diffMs / (24 * 60 * 60 * 1000));
    case 'hour':
      return Math.floor(diffMs / (60 * 60 * 1000));
    case 'minute':
      return Math.floor(diffMs / (60 * 1000));
    case 'second':
      return Math.floor(diffMs / 1000);
    case 'millisecond':
      return diffMs;
    default:
      return diffMs;
  }
}

export const diffInYears = (a: DateInput, b: DateInput) => diff(a, b, 'year');
export const diffInMonths = (a: DateInput, b: DateInput) => diff(a, b, 'month');
export const diffInWeeks = (a: DateInput, b: DateInput) => diff(a, b, 'week');
export const diffInDays = (a: DateInput, b: DateInput) => diff(a, b, 'day');
export const diffInHours = (a: DateInput, b: DateInput) => diff(a, b, 'hour');
export const diffInMinutes = (a: DateInput, b: DateInput) => diff(a, b, 'minute');
export const diffInSeconds = (a: DateInput, b: DateInput) => diff(a, b, 'second');

// ============================================
// Getters
// ============================================

export const getYear = (input: DateInput) => toDate(input).getFullYear();
export const getMonth = (input: DateInput) => toDate(input).getMonth(); // 0-indexed
export const getDate = (input: DateInput) => toDate(input).getDate();
export const getDay = (input: DateInput) => toDate(input).getDay(); // 0 = Sunday
export const getHours = (input: DateInput) => toDate(input).getHours();
export const getMinutes = (input: DateInput) => toDate(input).getMinutes();
export const getSeconds = (input: DateInput) => toDate(input).getSeconds();
export const getMilliseconds = (input: DateInput) => toDate(input).getMilliseconds();
export const getTime = (input: DateInput) => toDate(input).getTime();

// ============================================
// Start/End of Period
// ============================================

/**
 * Get start of a time period
 */
export function startOf(input: DateInput, unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'): Date {
  const d = toDate(input);

  switch (unit) {
    case 'year':
      return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
    case 'month':
      return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    case 'week': {
      const day = d.getDay();
      const diff = d.getDate() - day;
      return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0, 0);
    }
    case 'day':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    case 'hour':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0, 0);
    case 'minute':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0, 0);
    default:
      return d;
  }
}

/**
 * Get end of a time period
 */
export function endOf(input: DateInput, unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'): Date {
  const d = toDate(input);

  switch (unit) {
    case 'year':
      return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
    case 'month':
      return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    case 'week': {
      const day = d.getDay();
      const diff = d.getDate() + (6 - day);
      return new Date(d.getFullYear(), d.getMonth(), diff, 23, 59, 59, 999);
    }
    case 'day':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    case 'hour':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 59, 59, 999);
    case 'minute':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 59, 999);
    default:
      return d;
  }
}

// ============================================
// Utilities
// ============================================

/**
 * Get days in month
 */
export function daysInMonth(input: DateInput): number {
  const d = toDate(input);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/**
 * Check if year is a leap year
 */
export function isLeapYear(input: DateInput): boolean {
  const year = toDate(input).getFullYear();
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get day of year (1-366)
 */
export function dayOfYear(input: DateInput): number {
  const d = toDate(input);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

/**
 * Get week of year
 */
export function weekOfYear(input: DateInput): number {
  const d = toDate(input);
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil((diff / oneWeek) + 1);
}

/**
 * Get quarter (1-4)
 */
export function quarter(input: DateInput): number {
  return Math.floor(toDate(input).getMonth() / 3) + 1;
}

/**
 * Create a date from components
 */
export function create(
  year: number,
  month = 0,
  day = 1,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0
): Date {
  return new Date(year, month, day, hour, minute, second, ms);
}

/**
 * Get current timestamp
 */
export function now(): number {
  return Date.now();
}

/**
 * Get current date (start of today)
 */
export function today(): Date {
  return startOf(new Date(), 'day');
}

/**
 * Clone a date
 */
export function clone(input: DateInput): Date {
  return toDate(input);
}

/**
 * Get min date from array
 */
export function min(...dates: DateInput[]): Date {
  const timestamps = dates.map(d => toDate(d).getTime());
  return new Date(Math.min(...timestamps));
}

/**
 * Get max date from array
 */
export function max(...dates: DateInput[]): Date {
  const timestamps = dates.map(d => toDate(d).getTime());
  return new Date(Math.max(...timestamps));
}

// ============================================
// Duration
// ============================================

export interface Duration {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  asMilliseconds: () => number;
  asSeconds: () => number;
  asMinutes: () => number;
  asHours: () => number;
  asDays: () => number;
  asWeeks: () => number;
  humanize: (locale?: string) => string;
}

/**
 * Create a duration from milliseconds
 */
export function duration(ms: number): Duration;
export function duration(amount: number, unit: Unit): Duration;
export function duration(amountOrMs: number, unit?: Unit): Duration {
  let totalMs: number;

  if (unit) {
    switch (unit) {
      case 'year': totalMs = amountOrMs * 365 * 24 * 60 * 60 * 1000; break;
      case 'month': totalMs = amountOrMs * 30 * 24 * 60 * 60 * 1000; break;
      case 'week': totalMs = amountOrMs * 7 * 24 * 60 * 60 * 1000; break;
      case 'day': totalMs = amountOrMs * 24 * 60 * 60 * 1000; break;
      case 'hour': totalMs = amountOrMs * 60 * 60 * 1000; break;
      case 'minute': totalMs = amountOrMs * 60 * 1000; break;
      case 'second': totalMs = amountOrMs * 1000; break;
      case 'millisecond': totalMs = amountOrMs; break;
      default: totalMs = amountOrMs;
    }
  } else {
    totalMs = amountOrMs;
  }

  const absMs = Math.abs(totalMs);

  const years = Math.floor(absMs / (365 * 24 * 60 * 60 * 1000));
  const months = Math.floor((absMs % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
  const weeks = Math.floor((absMs % (30 * 24 * 60 * 60 * 1000)) / (7 * 24 * 60 * 60 * 1000));
  const days = Math.floor((absMs % (7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
  const hours = Math.floor((absMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((absMs % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((absMs % (60 * 1000)) / 1000);
  const milliseconds = absMs % 1000;

  return {
    years,
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    asMilliseconds: () => totalMs,
    asSeconds: () => totalMs / 1000,
    asMinutes: () => totalMs / (60 * 1000),
    asHours: () => totalMs / (60 * 60 * 1000),
    asDays: () => totalMs / (24 * 60 * 60 * 1000),
    asWeeks: () => totalMs / (7 * 24 * 60 * 60 * 1000),
    humanize: (locale = 'en') => {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      if (years > 0) return rtf.format(years, 'year').replace(/^in /, '').replace(/ ago$/, '');
      if (months > 0) return rtf.format(months, 'month').replace(/^in /, '').replace(/ ago$/, '');
      if (weeks > 0) return rtf.format(weeks, 'week').replace(/^in /, '').replace(/ ago$/, '');
      if (days > 0) return rtf.format(days, 'day').replace(/^in /, '').replace(/ ago$/, '');
      if (hours > 0) return rtf.format(hours, 'hour').replace(/^in /, '').replace(/ ago$/, '');
      if (minutes > 0) return rtf.format(minutes, 'minute').replace(/^in /, '').replace(/ ago$/, '');
      return rtf.format(seconds, 'second').replace(/^in /, '').replace(/ ago$/, '');
    },
  };
}

/**
 * Get duration between two dates
 */
export function durationBetween(a: DateInput, b: DateInput): Duration {
  const d1 = toDate(a);
  const d2 = toDate(b);
  return duration(Math.abs(d1.getTime() - d2.getTime()));
}

// ============================================
// UTC support
// ============================================

/**
 * Create a UTC date
 */
export function utc(input?: DateInput): Date {
  if (!input) {
    return new Date(Date.now());
  }
  const d = toDate(input);
  return new Date(Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds()
  ));
}

/**
 * Get UTC offset in minutes
 */
export function utcOffset(input: DateInput): number {
  return -toDate(input).getTimezoneOffset();
}

/**
 * Check if date is a weekend (Saturday or Sunday)
 */
export function isWeekend(input: DateInput): boolean {
  const day = toDate(input).getDay();
  return day === 0 || day === 6;
}

/**
 * Check if date is a weekday (Monday-Friday)
 */
export function isWeekday(input: DateInput): boolean {
  return !isWeekend(input);
}

/**
 * Get the name of the day
 */
export function dayName(input: DateInput, locale = 'en-US', style: 'long' | 'short' | 'narrow' = 'long'): string {
  return new Intl.DateTimeFormat(locale, { weekday: style }).format(toDate(input));
}

/**
 * Get the name of the month
 */
export function monthName(input: DateInput, locale = 'en-US', style: 'long' | 'short' | 'narrow' = 'long'): string {
  return new Intl.DateTimeFormat(locale, { month: style }).format(toDate(input));
}
