/**
 * Business day support
 */

import type { DateInput, BusinessDayOptions } from './types.js';
import { toDate } from './core.js';
import { addDays, subDays } from './arithmetic.js';
import { isSameDay } from './compare.js';

/**
 * Check if a date is a business day
 */
export function isBusinessDay(input: DateInput, options: BusinessDayOptions = {}): boolean {
  const d = toDate(input);
  const weekendDays = options.weekendDays ?? [0, 6];
  const holidays = options.holidays ?? [];

  if (weekendDays.includes(d.getDay())) {
    return false;
  }

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
