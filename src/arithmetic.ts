/**
 * Date arithmetic operations
 */

import type { DateInput, Unit } from './types.js';
import { toDate } from './core.js';

/**
 * Add time to a date (returns new Date)
 */
export function add(input: DateInput, amount: number, unit: Unit): Date {
  const d = toDate(input);

  switch (unit) {
    case 'year': {
      const targetYear = d.getFullYear() + amount;
      const targetMonth = d.getMonth();
      const maxDay = new Date(targetYear, targetMonth + 1, 0).getDate();
      const targetDay = Math.min(d.getDate(), maxDay);
      return new Date(targetYear, targetMonth, targetDay, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
    }
    case 'month': {
      const targetMonth = d.getMonth() + amount;
      const result = new Date(d.getFullYear(), targetMonth, 1, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
      const maxDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(d.getDate(), maxDay);
      result.setDate(targetDay);
      return result;
    }
    case 'week':
      return new Date(d.getTime() + amount * 7 * 24 * 60 * 60 * 1000);
    case 'day':
      return new Date(d.getTime() + amount * 24 * 60 * 60 * 1000);
    case 'hour':
      return new Date(d.getTime() + amount * 60 * 60 * 1000);
    case 'minute':
      return new Date(d.getTime() + amount * 60 * 1000);
    case 'second':
      return new Date(d.getTime() + amount * 1000);
    case 'millisecond':
      return new Date(d.getTime() + amount);
    default:
      return d;
  }
}

/**
 * Subtract time from a date (returns new Date)
 */
export function subtract(input: DateInput, amount: number, unit: Unit): Date {
  return add(input, -amount, unit);
}

// Convenience methods
export const addYears = (input: DateInput, n: number) => add(input, n, 'year');
export const addMonths = (input: DateInput, n: number) => add(input, n, 'month');
export const addWeeks = (input: DateInput, n: number) => add(input, n, 'week');
export const addDays = (input: DateInput, n: number) => add(input, n, 'day');
export const addHours = (input: DateInput, n: number) => add(input, n, 'hour');
export const addMinutes = (input: DateInput, n: number) => add(input, n, 'minute');
export const addSeconds = (input: DateInput, n: number) => add(input, n, 'second');

export const subYears = (input: DateInput, n: number) => subtract(input, n, 'year');
export const subMonths = (input: DateInput, n: number) => subtract(input, n, 'month');
export const subWeeks = (input: DateInput, n: number) => subtract(input, n, 'week');
export const subDays = (input: DateInput, n: number) => subtract(input, n, 'day');
export const subHours = (input: DateInput, n: number) => subtract(input, n, 'hour');
export const subMinutes = (input: DateInput, n: number) => subtract(input, n, 'minute');
export const subSeconds = (input: DateInput, n: number) => subtract(input, n, 'second');
