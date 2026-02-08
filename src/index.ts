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

// Cache for locale-aware month/day names (for bi-directional parsing)
const monthNamesCache = new Map<string, { long: Map<string, number>; short: Map<string, number> }>();
const dayNamesCache = new Map<string, { long: Map<string, number>; short: Map<string, number> }>();

function getMonthNamesMap(locale: string): { long: Map<string, number>; short: Map<string, number> } {
  let cached = monthNamesCache.get(locale);
  if (!cached) {
    const longMap = new Map<string, number>();
    const shortMap = new Map<string, number>();
    for (let m = 0; m < 12; m++) {
      const date = new Date(2024, m, 15);
      const longName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date).toLowerCase();
      const shortName = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date).toLowerCase();
      longMap.set(longName, m);
      shortMap.set(shortName, m);
    }
    cached = { long: longMap, short: shortMap };
    monthNamesCache.set(locale, cached);
  }
  return cached;
}

function getDayNamesMap(locale: string): { long: Map<string, number>; short: Map<string, number> } {
  let cached = dayNamesCache.get(locale);
  if (!cached) {
    const longMap = new Map<string, number>();
    const shortMap = new Map<string, number>();
    // Jan 7, 2024 is a Sunday (day 0)
    for (let d = 0; d < 7; d++) {
      const date = new Date(2024, 0, 7 + d);
      const longName = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date).toLowerCase();
      const shortName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date).toLowerCase();
      longMap.set(longName, d);
      shortMap.set(shortName, d);
    }
    cached = { long: longMap, short: shortMap };
    dayNamesCache.set(locale, cached);
  }
  return cached;
}

function buildMonthRegex(locale: string, style: 'long' | 'short'): string {
  const names: string[] = [];
  for (let m = 0; m < 12; m++) {
    const date = new Date(2024, m, 15);
    const name = new Intl.DateTimeFormat(locale, { month: style }).format(date);
    names.push(name);
  }
  // Sort by length (longest first) and escape regex chars
  return '(' + names
    .sort((a, b) => b.length - a.length)
    .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|') + ')';
}

function buildDayRegex(locale: string, style: 'long' | 'short'): string {
  const names: string[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(2024, 0, 7 + d);
    const name = new Intl.DateTimeFormat(locale, { weekday: style }).format(date);
    names.push(name);
  }
  return '(' + names
    .sort((a, b) => b.length - a.length)
    .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|') + ')';
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
 * Parse date from string with format (bi-directional parsing)
 * Tokens: YYYY, YY, MMMM, MMM, MM, M, DD, D, dddd, ddd, HH, H, hh, h, mm, m, ss, s, SSS, A, a
 * Supports locale-aware month/day names (e.g., "January", "Jan", "Monday", "Mon")
 */
export function parse(dateStr: string, template: string, locale = 'en-US'): Date {
  // Build locale-aware token definitions
  type TokenDef = { token: string; regex: string; field: string; transform?: (v: string, locale: string) => number };

  const monthNames = getMonthNamesMap(locale);
  const dayNames = getDayNamesMap(locale);

  const tokenDefs: TokenDef[] = [
    { token: 'YYYY', regex: '(\\d{4})', field: 'year', transform: (v) => parseInt(v, 10) },
    { token: 'YY', regex: '(\\d{2})', field: 'year', transform: (v) => 2000 + parseInt(v, 10) },
    { token: 'MMMM', regex: buildMonthRegex(locale, 'long'), field: 'month', transform: (v, loc) => getMonthNamesMap(loc).long.get(v.toLowerCase()) ?? 0 },
    { token: 'MMM', regex: buildMonthRegex(locale, 'short'), field: 'month', transform: (v, loc) => getMonthNamesMap(loc).short.get(v.toLowerCase()) ?? 0 },
    { token: 'MM', regex: '(\\d{2})', field: 'month', transform: (v) => parseInt(v, 10) - 1 },
    { token: 'M', regex: '(\\d{1,2})', field: 'month', transform: (v) => parseInt(v, 10) - 1 },
    { token: 'dddd', regex: buildDayRegex(locale, 'long'), field: 'weekday', transform: (v, loc) => getDayNamesMap(loc).long.get(v.toLowerCase()) ?? 0 },
    { token: 'ddd', regex: buildDayRegex(locale, 'short'), field: 'weekday', transform: (v, loc) => getDayNamesMap(loc).short.get(v.toLowerCase()) ?? 0 },
    { token: 'DD', regex: '(\\d{2})', field: 'day', transform: (v) => parseInt(v, 10) },
    { token: 'D', regex: '(\\d{1,2})', field: 'day', transform: (v) => parseInt(v, 10) },
    { token: 'HH', regex: '(\\d{2})', field: 'hour', transform: (v) => parseInt(v, 10) },
    { token: 'H', regex: '(\\d{1,2})', field: 'hour', transform: (v) => parseInt(v, 10) },
    { token: 'hh', regex: '(\\d{2})', field: 'hour12', transform: (v) => parseInt(v, 10) },
    { token: 'h', regex: '(\\d{1,2})', field: 'hour12', transform: (v) => parseInt(v, 10) },
    { token: 'mm', regex: '(\\d{2})', field: 'minute', transform: (v) => parseInt(v, 10) },
    { token: 'm', regex: '(\\d{1,2})', field: 'minute', transform: (v) => parseInt(v, 10) },
    { token: 'ss', regex: '(\\d{2})', field: 'second', transform: (v) => parseInt(v, 10) },
    { token: 's', regex: '(\\d{1,2})', field: 'second', transform: (v) => parseInt(v, 10) },
    { token: 'SSS', regex: '(\\d{3})', field: 'ms', transform: (v) => parseInt(v, 10) },
    { token: 'A', regex: '(AM|PM)', field: 'meridiem', transform: (v) => v === 'PM' ? 1 : 0 },
    { token: 'a', regex: '(am|pm)', field: 'meridiem', transform: (v) => v === 'pm' ? 1 : 0 },
  ];

  // Sort by token length (longest first) to avoid partial matches
  const sortedDefs = [...tokenDefs].sort((a, b) => b.token.length - a.token.length);

  // Find which tokens are in the template and their positions
  const foundTokens: Array<{ pos: number; def: TokenDef }> = [];
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
  // Escape special regex chars first (but preserve token placeholders)
  const tokenPositions = foundTokens.map(t => ({ start: t.pos, end: t.pos + t.def.token.length, def: t.def }));

  // Replace tokens with their regex patterns
  for (const { def } of [...foundTokens].sort((a, b) => b.pos - a.pos)) {
    pattern = pattern.replace(def.token, def.regex);
  }

  // Escape remaining special chars (not in token regexes)
  // Actually, we need a different approach - escape first, then replace
  let escapedTemplate = template.replace(/[.*+?^${}|[\]\\]/g, '\\$&');
  for (const { def } of [...foundTokens].sort((a, b) => b.pos - a.pos)) {
    const escapedToken = def.token.replace(/[.*+?^${}|[\]\\]/g, '\\$&');
    escapedTemplate = escapedTemplate.replace(escapedToken, def.regex);
  }

  const regex = new RegExp('^' + escapedTemplate + '$', 'i');
  const match = dateStr.match(regex);

  if (!match) {
    return new Date(NaN);
  }

  const parts: Record<string, number> = {
    year: new Date().getFullYear(),
    month: 0,
    day: 1,
    hour: 0,
    hour12: 0,
    minute: 0,
    second: 0,
    ms: 0,
    meridiem: -1, // -1 = not set
    weekday: -1,  // -1 = not set (weekday is informational only)
  };

  // Apply matches in order
  for (let i = 0; i < foundTokens.length; i++) {
    const { def } = foundTokens[i];
    const rawValue = match[i + 1];
    const value = def.transform ? def.transform(rawValue, locale) : parseInt(rawValue, 10);
    parts[def.field] = value;
  }

  // Handle 12-hour format with meridiem
  let hour = parts.hour;
  if (parts.hour12 > 0 && parts.meridiem >= 0) {
    hour = parts.hour12;
    if (parts.meridiem === 1 && hour !== 12) {
      hour += 12;
    } else if (parts.meridiem === 0 && hour === 12) {
      hour = 0;
    }
  } else if (parts.hour12 > 0) {
    hour = parts.hour12;
  }

  return new Date(parts.year, parts.month, parts.day, hour, parts.minute, parts.second, parts.ms);
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
    case 'year': {
      // Handle edge case: Feb 29 + 1 year in non-leap year → Feb 28
      const targetYear = d.getFullYear() + amount;
      const targetMonth = d.getMonth();
      const maxDay = new Date(targetYear, targetMonth + 1, 0).getDate();
      const targetDay = Math.min(d.getDate(), maxDay);
      return new Date(targetYear, targetMonth, targetDay, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
    }
    case 'month': {
      // Handle edge case: Jan 31 + 1 month → Feb 28/29 (not Mar 2/3)
      const targetMonth = d.getMonth() + amount;
      const result = new Date(d.getFullYear(), targetMonth, 1, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
      const maxDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(d.getDate(), maxDay);
      result.setDate(targetDay);
      return result;
    }
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

// ============================================
// Timezone Support (using native Intl)
// ============================================

/**
 * Format date in a specific timezone
 */
export function formatInTz(input: DateInput, timezone: string, options: Omit<FormatOptions, 'timeZone'> = {}): string {
  return format(input, { ...options, timeZone: timezone });
}

/**
 * Format date with template in a specific timezone
 */
export function formatStrInTz(input: DateInput, template: string, timezone: string, locale = 'en-US'): string {
  const d = toDate(input);

  // Get date parts in the target timezone
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '';

  const year = parseInt(get('year'));
  const month = parseInt(get('month')) - 1;
  const day = parseInt(get('day'));
  const hours = parseInt(get('hour'));
  const minutes = parseInt(get('minute'));
  const seconds = parseInt(get('second'));

  // Get localized names in target timezone
  const monthLong = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: timezone }).format(d);
  const monthShort = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: timezone }).format(d);
  const dayLong = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: timezone }).format(d);
  const dayShort = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: timezone }).format(d);

  const pad = (n: number, len = 2) => String(n).padStart(len, '0');

  const tokens: Record<string, string> = {
    'YYYY': String(year),
    'YY': String(year).slice(-2),
    'MMMM': monthLong,
    'MMM': monthShort,
    'MM': pad(month + 1),
    'M': String(month + 1),
    'DD': pad(day),
    'D': String(day),
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
    'A': hours < 12 ? 'AM' : 'PM',
    'a': hours < 12 ? 'am' : 'pm',
    'z': getTimezoneAbbr(d, timezone),
    'Z': getTimezoneOffsetStr(d, timezone),
  };

  const pattern = Object.keys(tokens)
    .sort((a, b) => b.length - a.length)
    .join('|');

  return template.replace(new RegExp(pattern, 'g'), match => tokens[match] || match);
}

/**
 * Get timezone abbreviation (e.g., "PST", "EST")
 */
export function getTimezoneAbbr(input: DateInput, timezone: string): string {
  const d = toDate(input);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(d);
  return parts.find(p => p.type === 'timeZoneName')?.value || timezone;
}

/**
 * Get timezone long name (e.g., "Pacific Standard Time")
 */
export function getTimezoneName(input: DateInput, timezone: string, locale = 'en-US'): string {
  const d = toDate(input);
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    timeZoneName: 'long',
  });
  const parts = formatter.formatToParts(d);
  return parts.find(p => p.type === 'timeZoneName')?.value || timezone;
}

/**
 * Get timezone offset string (e.g., "+08:00", "-05:00")
 */
export function getTimezoneOffsetStr(input: DateInput, timezone: string): string {
  const d = toDate(input);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  });
  const parts = formatter.formatToParts(d);
  const offset = parts.find(p => p.type === 'timeZoneName')?.value || '';
  // Convert "GMT+8" to "+08:00" format
  const match = offset.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (match) {
    const sign = match[1];
    const hours = match[2].padStart(2, '0');
    const mins = match[3] || '00';
    return `${sign}${hours}:${mins}`;
  }
  return offset;
}

/**
 * Get timezone offset in minutes for a specific timezone
 */
export function tzOffset(input: DateInput, timezone: string): number {
  const d = toDate(input);

  // Get the time in the target timezone
  const tzDate = new Date(d.toLocaleString('en-US', { timeZone: timezone }));
  const utcDate = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));

  return (tzDate.getTime() - utcDate.getTime()) / (60 * 1000);
}

/**
 * Convert a date to a different timezone (returns date parts in that timezone)
 */
export function toTimezone(input: DateInput, timezone: string): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  timezone: string;
  offset: string;
  abbr: string;
} {
  const d = toDate(input);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '0';

  return {
    year: parseInt(get('year')),
    month: parseInt(get('month')) - 1,
    day: parseInt(get('day')),
    hours: parseInt(get('hour')),
    minutes: parseInt(get('minute')),
    seconds: parseInt(get('second')),
    milliseconds: parseInt(get('fractionalSecond') || '0'),
    timezone,
    offset: getTimezoneOffsetStr(d, timezone),
    abbr: getTimezoneAbbr(d, timezone),
  };
}

/**
 * Guess the user's timezone
 */
export function guessTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Check if a timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Common timezone identifiers
 */
export const TIMEZONES = {
  // Americas
  'America/New_York': 'Eastern Time (US)',
  'America/Chicago': 'Central Time (US)',
  'America/Denver': 'Mountain Time (US)',
  'America/Los_Angeles': 'Pacific Time (US)',
  'America/Anchorage': 'Alaska Time',
  'America/Toronto': 'Eastern Time (Canada)',
  'America/Vancouver': 'Pacific Time (Canada)',
  'America/Mexico_City': 'Mexico City',
  'America/Sao_Paulo': 'São Paulo',
  'America/Buenos_Aires': 'Buenos Aires',

  // Europe
  'Europe/London': 'London',
  'Europe/Paris': 'Paris',
  'Europe/Berlin': 'Berlin',
  'Europe/Rome': 'Rome',
  'Europe/Madrid': 'Madrid',
  'Europe/Amsterdam': 'Amsterdam',
  'Europe/Moscow': 'Moscow',
  'Europe/Istanbul': 'Istanbul',

  // Asia
  'Asia/Tokyo': 'Tokyo',
  'Asia/Shanghai': 'Shanghai',
  'Asia/Hong_Kong': 'Hong Kong',
  'Asia/Singapore': 'Singapore',
  'Asia/Seoul': 'Seoul',
  'Asia/Bangkok': 'Bangkok',
  'Asia/Dubai': 'Dubai',
  'Asia/Kolkata': 'Mumbai/Kolkata',
  'Asia/Jakarta': 'Jakarta',
  'Asia/Manila': 'Manila',

  // Oceania
  'Australia/Sydney': 'Sydney',
  'Australia/Melbourne': 'Melbourne',
  'Australia/Perth': 'Perth',
  'Pacific/Auckland': 'Auckland',
  'Pacific/Honolulu': 'Honolulu',

  // Africa
  'Africa/Cairo': 'Cairo',
  'Africa/Johannesburg': 'Johannesburg',
  'Africa/Lagos': 'Lagos',

  // UTC
  'UTC': 'UTC',
} as const;

export type TimezoneId = keyof typeof TIMEZONES;

/**
 * List all common timezones with their current offsets
 */
export function listTimezones(input?: DateInput): Array<{
  id: string;
  name: string;
  abbr: string;
  offset: string;
  offsetMinutes: number;
}> {
  const d = input ? toDate(input) : new Date();

  return Object.entries(TIMEZONES).map(([id, name]) => ({
    id,
    name,
    abbr: getTimezoneAbbr(d, id),
    offset: getTimezoneOffsetStr(d, id),
    offsetMinutes: tzOffset(d, id),
  })).sort((a, b) => a.offsetMinutes - b.offsetMinutes);
}

/**
 * Get current time in a specific timezone as formatted string
 */
export function nowInTz(timezone: string, options: Omit<FormatOptions, 'timeZone'> = {}): string {
  return formatInTz(new Date(), timezone, options);
}

/**
 * Compare times across timezones
 */
export function sameInstant(a: DateInput, b: DateInput): boolean {
  return toDate(a).getTime() === toDate(b).getTime();
}

// ============================================
// Business Day Support
// ============================================

export interface BusinessDayOptions {
  weekendDays?: number[];  // Default: [0, 6] (Sunday, Saturday)
  holidays?: DateInput[];  // Specific dates to exclude
}

/**
 * Check if a date is a business day
 */
export function isBusinessDay(input: DateInput, options: BusinessDayOptions = {}): boolean {
  const d = toDate(input);
  const weekendDays = options.weekendDays ?? [0, 6];
  const holidays = options.holidays ?? [];

  // Check if it's a weekend
  if (weekendDays.includes(d.getDay())) {
    return false;
  }

  // Check if it's a holiday
  for (const holiday of holidays) {
    if (isSameDay(d, holiday)) {
      return false;
    }
  }

  return true;
}

/**
 * Get the next business day
 */
export function nextBusinessDay(input: DateInput, options: BusinessDayOptions = {}): Date {
  let d = addDays(input, 1);
  while (!isBusinessDay(d, options)) {
    d = addDays(d, 1);
  }
  return d;
}

/**
 * Get the previous business day
 */
export function prevBusinessDay(input: DateInput, options: BusinessDayOptions = {}): Date {
  let d = subDays(input, 1);
  while (!isBusinessDay(d, options)) {
    d = subDays(d, 1);
  }
  return d;
}

/**
 * Add business days to a date
 */
export function addBusinessDays(input: DateInput, days: number, options: BusinessDayOptions = {}): Date {
  let d = toDate(input);
  let remaining = Math.abs(days);
  const direction = days >= 0 ? 1 : -1;

  while (remaining > 0) {
    d = addDays(d, direction);
    if (isBusinessDay(d, options)) {
      remaining--;
    }
  }

  return d;
}

/**
 * Subtract business days from a date
 */
export function subBusinessDays(input: DateInput, days: number, options: BusinessDayOptions = {}): Date {
  return addBusinessDays(input, -days, options);
}

/**
 * Get the number of business days between two dates
 */
export function diffInBusinessDays(a: DateInput, b: DateInput, options: BusinessDayOptions = {}): number {
  const start = toDate(a);
  const end = toDate(b);
  const direction = start <= end ? 1 : -1;

  let current = start;
  let count = 0;

  while ((direction === 1 && current < end) || (direction === -1 && current > end)) {
    current = addDays(current, direction);
    if (isBusinessDay(current, options)) {
      count++;
    }
  }

  return count * direction;
}

// ============================================
// Date Ranges / Intervals
// ============================================

export interface Interval {
  start: Date;
  end: Date;
  contains(date: DateInput): boolean;
  overlaps(other: Interval): boolean;
  eachDay(): Generator<Date>;
  eachWeek(): Generator<Date>;
  eachMonth(): Generator<Date>;
  duration(): Duration;
  days(): number;
  isValid(): boolean;
}

/**
 * Create an interval between two dates
 */
export function interval(start: DateInput, end: DateInput): Interval {
  const s = toDate(start);
  const e = toDate(end);

  return {
    start: s,
    end: e,

    contains(date: DateInput): boolean {
      return isBetween(date, s, e);
    },

    overlaps(other: Interval): boolean {
      return s <= other.end && e >= other.start;
    },

    *eachDay(): Generator<Date> {
      let current = startOf(s, 'day');
      const endDay = startOf(e, 'day');
      while (current <= endDay) {
        yield new Date(current);
        current = addDays(current, 1);
      }
    },

    *eachWeek(): Generator<Date> {
      let current = startOf(s, 'week');
      const endWeek = startOf(e, 'week');
      while (current <= endWeek) {
        yield new Date(current);
        current = addWeeks(current, 1);
      }
    },

    *eachMonth(): Generator<Date> {
      let current = startOf(s, 'month');
      const endMonth = startOf(e, 'month');
      while (current <= endMonth) {
        yield new Date(current);
        current = addMonths(current, 1);
      }
    },

    duration(): Duration {
      return durationBetween(s, e);
    },

    days(): number {
      return diffInDays(e, s);
    },

    isValid(): boolean {
      return isValid(s) && isValid(e) && s <= e;
    },
  };
}

/**
 * Check if two intervals overlap
 */
export function areIntervalsOverlapping(a: Interval, b: Interval): boolean {
  return a.overlaps(b);
}

/**
 * Check if a date is within an interval
 */
export function isWithinInterval(date: DateInput, int: Interval): boolean {
  return int.contains(date);
}

/**
 * Get all days in an interval as an array
 */
export function eachDayOfInterval(int: Interval): Date[] {
  return [...int.eachDay()];
}

/**
 * Get all weeks in an interval as an array
 */
export function eachWeekOfInterval(int: Interval): Date[] {
  return [...int.eachWeek()];
}

/**
 * Get all months in an interval as an array
 */
export function eachMonthOfInterval(int: Interval): Date[] {
  return [...int.eachMonth()];
}

// ============================================
// Chainable Wrapper
// ============================================

export interface DateWrapper {
  /** Get the underlying Date object */
  date(): Date;
  /** Get the timestamp */
  valueOf(): number;

  // Formatting
  format(template: string, locale?: string): string;
  toISO(): string;
  toISOString(): string;
  toTime(): string;
  relative(options?: RelativeTimeOptions): string;
  formatDate(locale?: string): string;
  formatDateTime(locale?: string): string;
  formatTime(locale?: string): string;

  // Arithmetic (return new DateWrapper)
  add(amount: number, unit: Unit): DateWrapper;
  subtract(amount: number, unit: Unit): DateWrapper;
  addYears(n: number): DateWrapper;
  addMonths(n: number): DateWrapper;
  addWeeks(n: number): DateWrapper;
  addDays(n: number): DateWrapper;
  addHours(n: number): DateWrapper;
  addMinutes(n: number): DateWrapper;
  addSeconds(n: number): DateWrapper;
  subYears(n: number): DateWrapper;
  subMonths(n: number): DateWrapper;
  subWeeks(n: number): DateWrapper;
  subDays(n: number): DateWrapper;
  subHours(n: number): DateWrapper;
  subMinutes(n: number): DateWrapper;
  subSeconds(n: number): DateWrapper;

  // Period boundaries
  startOf(unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'): DateWrapper;
  endOf(unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'): DateWrapper;

  // Comparisons
  isBefore(other: DateInput): boolean;
  isAfter(other: DateInput): boolean;
  isSameDay(other: DateInput): boolean;
  isSameMonth(other: DateInput): boolean;
  isSameYear(other: DateInput): boolean;
  isBetween(start: DateInput, end: DateInput): boolean;
  isToday(): boolean;
  isYesterday(): boolean;
  isTomorrow(): boolean;
  isPast(): boolean;
  isFuture(): boolean;
  isWeekend(): boolean;
  isWeekday(): boolean;
  isValid(): boolean;

  // Getters
  year(): number;
  month(): number;
  day(): number;
  weekday(): number;
  hours(): number;
  minutes(): number;
  seconds(): number;
  milliseconds(): number;
  timestamp(): number;
  dayOfYear(): number;
  weekOfYear(): number;
  quarter(): number;
  daysInMonth(): number;
  isLeapYear(): boolean;

  // Difference
  diff(other: DateInput, unit: Unit): number;
  diffInDays(other: DateInput): number;
  diffInHours(other: DateInput): number;
  diffInMinutes(other: DateInput): number;
  diffInMonths(other: DateInput): number;
  diffInYears(other: DateInput): number;

  // Business days
  addBusinessDays(n: number, options?: BusinessDayOptions): DateWrapper;
  subBusinessDays(n: number, options?: BusinessDayOptions): DateWrapper;
  isBusinessDay(options?: BusinessDayOptions): boolean;
  nextBusinessDay(options?: BusinessDayOptions): DateWrapper;
  prevBusinessDay(options?: BusinessDayOptions): DateWrapper;

  // Clone
  clone(): DateWrapper;
}

/**
 * Create a chainable date wrapper (Day.js-like API)
 */
export function d(input?: DateInput): DateWrapper {
  const date = input ? toDate(input) : new Date();

  const wrapper: DateWrapper = {
    date: () => new Date(date.getTime()),
    valueOf: () => date.getTime(),

    // Formatting
    format: (template: string, locale?: string) => formatStr(date, template, locale),
    toISO: () => toISO(date),
    toISOString: () => toISOString(date),
    toTime: () => toTime(date),
    relative: (options?: RelativeTimeOptions) => relative(date, options),
    formatDate: (locale?: string) => formatDate(date, locale),
    formatDateTime: (locale?: string) => formatDateTime(date, locale),
    formatTime: (locale?: string) => formatTime(date, locale),

    // Arithmetic
    add: (amount: number, unit: Unit) => d(add(date, amount, unit)),
    subtract: (amount: number, unit: Unit) => d(subtract(date, amount, unit)),
    addYears: (n: number) => d(addYears(date, n)),
    addMonths: (n: number) => d(addMonths(date, n)),
    addWeeks: (n: number) => d(addWeeks(date, n)),
    addDays: (n: number) => d(addDays(date, n)),
    addHours: (n: number) => d(addHours(date, n)),
    addMinutes: (n: number) => d(addMinutes(date, n)),
    addSeconds: (n: number) => d(addSeconds(date, n)),
    subYears: (n: number) => d(subYears(date, n)),
    subMonths: (n: number) => d(subMonths(date, n)),
    subWeeks: (n: number) => d(subWeeks(date, n)),
    subDays: (n: number) => d(subDays(date, n)),
    subHours: (n: number) => d(subHours(date, n)),
    subMinutes: (n: number) => d(subMinutes(date, n)),
    subSeconds: (n: number) => d(subSeconds(date, n)),

    // Period boundaries
    startOf: (unit) => d(startOf(date, unit)),
    endOf: (unit) => d(endOf(date, unit)),

    // Comparisons
    isBefore: (other: DateInput) => isBefore(date, other),
    isAfter: (other: DateInput) => isAfter(date, other),
    isSameDay: (other: DateInput) => isSameDay(date, other),
    isSameMonth: (other: DateInput) => isSameMonth(date, other),
    isSameYear: (other: DateInput) => isSameYear(date, other),
    isBetween: (start: DateInput, end: DateInput) => isBetween(date, start, end),
    isToday: () => isToday(date),
    isYesterday: () => isYesterday(date),
    isTomorrow: () => isTomorrow(date),
    isPast: () => isPast(date),
    isFuture: () => isFuture(date),
    isWeekend: () => isWeekend(date),
    isWeekday: () => isWeekday(date),
    isValid: () => isValid(date),

    // Getters
    year: () => getYear(date),
    month: () => getMonth(date),
    day: () => getDate(date),
    weekday: () => getDay(date),
    hours: () => getHours(date),
    minutes: () => getMinutes(date),
    seconds: () => getSeconds(date),
    milliseconds: () => getMilliseconds(date),
    timestamp: () => getTime(date),
    dayOfYear: () => dayOfYear(date),
    weekOfYear: () => weekOfYear(date),
    quarter: () => quarter(date),
    daysInMonth: () => daysInMonth(date),
    isLeapYear: () => isLeapYear(date),

    // Difference
    diff: (other: DateInput, unit: Unit) => diff(date, other, unit),
    diffInDays: (other: DateInput) => diffInDays(date, other),
    diffInHours: (other: DateInput) => diffInHours(date, other),
    diffInMinutes: (other: DateInput) => diffInMinutes(date, other),
    diffInMonths: (other: DateInput) => diffInMonths(date, other),
    diffInYears: (other: DateInput) => diffInYears(date, other),

    // Business days
    addBusinessDays: (n: number, options?: BusinessDayOptions) => d(addBusinessDays(date, n, options)),
    subBusinessDays: (n: number, options?: BusinessDayOptions) => d(subBusinessDays(date, n, options)),
    isBusinessDay: (options?: BusinessDayOptions) => isBusinessDay(date, options),
    nextBusinessDay: (options?: BusinessDayOptions) => d(nextBusinessDay(date, options)),
    prevBusinessDay: (options?: BusinessDayOptions) => d(prevBusinessDay(date, options)),

    // Clone
    clone: () => d(date),
  };

  return wrapper;
}
