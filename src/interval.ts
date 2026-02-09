/**
 * Date intervals/ranges
 */

import type { DateInput, Interval, Duration } from './types.js';
import { toDate, isValid } from './core.js';
import { addDays, addWeeks, addMonths } from './arithmetic.js';
import { isBetween } from './compare.js';
import { diffInDays } from './diff.js';
import { startOf } from './period.js';
import { durationBetween } from './duration.js';

/**
 * Create an interval between two dates
 */
export function interval(start: DateInput, end: DateInput): Interval {
  const s = toDate(start);
  const e = toDate(end);

  return {
    start: s,
    end: e,

    contains(date: DateInput): boolean {
      return isBetween(date, s, e);
    },

    overlaps(other: Interval): boolean {
      return s <= other.end && e >= other.start;
    },

    *eachDay(): Generator<Date> {
      let current = startOf(s, 'day');
      const endDay = startOf(e, 'day');
      while (current <= endDay) {
        yield new Date(current);
        current = addDays(current, 1);
      }
    },

    *eachWeek(): Generator<Date> {
      let current = startOf(s, 'week');
      const endWeek = startOf(e, 'week');
      while (current <= endWeek) {
        yield new Date(current);
        current = addWeeks(current, 1);
      }
    },

    *eachMonth(): Generator<Date> {
      let current = startOf(s, 'month');
      const endMonth = startOf(e, 'month');
      while (current <= endMonth) {
        yield new Date(current);
        current = addMonths(current, 1);
      }
    },

    duration(): Duration {
      return durationBetween(s, e);
    },

    days(): number {
      return diffInDays(e, s);
    },

    isValid(): boolean {
      return isValid(s) && isValid(e) && s <= e;
    },
  };
}

/**
 * Check if two intervals overlap
 */
export function areIntervalsOverlapping(a: Interval, b: Interval): boolean {
  return a.overlaps(b);
}

/**
 * Check if a date is within an interval
 */
export function isWithinInterval(date: DateInput, int: Interval): boolean {
  return int.contains(date);
}

/**
 * Get all days in an interval as an array
 */
export function eachDayOfInterval(int: Interval): Date[] {
  return [...int.eachDay()];
}

/**
 * Get all weeks in an interval as an array
 */
export function eachWeekOfInterval(int: Interval): Date[] {
  return [...int.eachWeek()];
}

/**
 * Get all months in an interval as an array
 */
export function eachMonthOfInterval(int: Interval): Date[] {
  return [...int.eachMonth()];
}
