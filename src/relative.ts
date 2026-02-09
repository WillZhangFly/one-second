/**
 * Relative time formatting
 */

import type { DateInput, RelativeTimeOptions } from './types.js';
import { toDate } from './core.js';

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
