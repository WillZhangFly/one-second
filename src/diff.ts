/**
 * Date difference calculations
 */

import type { DateInput, Unit } from './types.js';
import { toDate } from './core.js';

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
