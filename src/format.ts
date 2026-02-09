/**
 * Date formatting and parsing functions
 */

import type { DateInput, FormatOptions } from './types.js';
import { toDate } from './core.js';

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

  const pattern = Object.keys(tokens)
    .sort((a, b) => b.length - a.length)
    .join('|');

  return template.replace(new RegExp(pattern, 'g'), match => tokens[match] || match);
}

/**
 * Parse date from string with format (bi-directional parsing)
 */
export function parse(dateStr: string, template: string, locale = 'en-US'): Date {
  type TokenDef = { token: string; regex: string; field: string; transform?: (v: string, locale: string) => number };

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

  const sortedDefs = [...tokenDefs].sort((a, b) => b.token.length - a.token.length);
  const foundTokens: Array<{ pos: number; def: TokenDef }> = [];
  let searchTemplate = template;

  for (const def of sortedDefs) {
    let pos = searchTemplate.indexOf(def.token);
    while (pos !== -1) {
      foundTokens.push({ pos, def });
      searchTemplate = searchTemplate.substring(0, pos) + '\x00'.repeat(def.token.length) + searchTemplate.substring(pos + def.token.length);
      pos = searchTemplate.indexOf(def.token);
    }
  }

  foundTokens.sort((a, b) => a.pos - b.pos);

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
    meridiem: -1,
    weekday: -1,
  };

  for (let i = 0; i < foundTokens.length; i++) {
    const { def } = foundTokens[i];
    const rawValue = match[i + 1];
    const value = def.transform ? def.transform(rawValue, locale) : parseInt(rawValue, 10);
    parts[def.field] = value;
  }

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
