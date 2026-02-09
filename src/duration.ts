/**
 * Duration functions
 */

import type { DateInput, Duration, Unit } from './types.js';
import { toDate } from './core.js';

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
