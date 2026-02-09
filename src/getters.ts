/**
 * Date getter functions
 */

import type { DateInput } from './types.js';
import { toDate } from './core.js';

export const getYear = (input: DateInput) => toDate(input).getFullYear();
export const getMonth = (input: DateInput) => toDate(input).getMonth();
export const getDate = (input: DateInput) => toDate(input).getDate();
export const getDay = (input: DateInput) => toDate(input).getDay();
export const getHours = (input: DateInput) => toDate(input).getHours();
export const getMinutes = (input: DateInput) => toDate(input).getMinutes();
export const getSeconds = (input: DateInput) => toDate(input).getSeconds();
export const getMilliseconds = (input: DateInput) => toDate(input).getMilliseconds();
export const getTime = (input: DateInput) => toDate(input).getTime();

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
