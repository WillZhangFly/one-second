/**
 * Start/End of period functions
 */

import type { DateInput } from './types.js';
import { toDate } from './core.js';

/**
 * Get start of a time period
 */
export function startOf(input: DateInput, unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'): Date {
  const d = toDate(input);

  switch (unit) {
    case 'year':
      return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
    case 'month':
      return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    case 'week': {
      const day = d.getDay();
      const diff = d.getDate() - day;
      return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0, 0);
    }
    case 'day':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    case 'hour':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0, 0);
    case 'minute':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0, 0);
    default:
      return d;
  }
}

/**
 * Get end of a time period
 */
export function endOf(input: DateInput, unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'): Date {
  const d = toDate(input);

  switch (unit) {
    case 'year':
      return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
    case 'month':
      return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    case 'week': {
      const day = d.getDay();
      const diff = d.getDate() + (6 - day);
      return new Date(d.getFullYear(), d.getMonth(), diff, 23, 59, 59, 999);
    }
    case 'day':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    case 'hour':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 59, 59, 999);
    case 'minute':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 59, 999);
    default:
      return d;
  }
}

/**
 * Get current date (start of today)
 */
export function today(): Date {
  return startOf(new Date(), 'day');
}
