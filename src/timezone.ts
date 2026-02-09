/**
 * Timezone support functions
 */

import type { DateInput, FormatOptions } from './types.js';
import { toDate } from './core.js';
import { format } from './format.js';

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
 * Format date in a specific timezone
 */
export function formatInTz(input: DateInput, timezone: string, options: Omit<FormatOptions, 'timeZone'> = {}): string {
  return format(input, { ...options, timeZone: timezone });
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
  const tzDate = new Date(d.toLocaleString('en-US', { timeZone: timezone }));
  const utcDate = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
  return (tzDate.getTime() - utcDate.getTime()) / (60 * 1000);
}

/**
 * Format date with template in a specific timezone
 */
export function formatStrInTz(input: DateInput, template: string, timezone: string, locale = 'en-US'): string {
  const d = toDate(input);

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
  'Europe/London': 'London',
  'Europe/Paris': 'Paris',
  'Europe/Berlin': 'Berlin',
  'Europe/Rome': 'Rome',
  'Europe/Madrid': 'Madrid',
  'Europe/Amsterdam': 'Amsterdam',
  'Europe/Moscow': 'Moscow',
  'Europe/Istanbul': 'Istanbul',
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
  'Australia/Sydney': 'Sydney',
  'Australia/Melbourne': 'Melbourne',
  'Australia/Perth': 'Perth',
  'Pacific/Auckland': 'Auckland',
  'Pacific/Honolulu': 'Honolulu',
  'Africa/Cairo': 'Cairo',
  'Africa/Johannesburg': 'Johannesburg',
  'Africa/Lagos': 'Lagos',
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
