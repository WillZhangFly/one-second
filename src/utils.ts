/**
 * Utility functions
 */

import type { DateInput } from './types.js';
import { toDate } from './core.js';

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
