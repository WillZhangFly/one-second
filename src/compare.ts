/**
 * Date comparison functions
 */

import type { DateInput } from './types.js';
import { toDate } from './core.js';
import { addDays, subDays } from './arithmetic.js';

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
