/**
 * Core date conversion functions
 */

import type { DateInput } from './types.js';

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

/**
 * Clone a date
 */
export function clone(input: DateInput): Date {
  return toDate(input);
}

/**
 * Get current timestamp
 */
export function now(): number {
  return Date.now();
}
