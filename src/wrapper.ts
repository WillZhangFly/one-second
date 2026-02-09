/**
 * Chainable date wrapper
 */

import type { DateInput, Unit, RelativeTimeOptions, BusinessDayOptions } from './types.js';
import { toDate, isValid } from './core.js';
import { formatStr, toISO, toISOString, toTime, formatDate, formatDateTime, formatTime } from './format.js';
import { relative } from './relative.js';
import { add, subtract, addYears, addMonths, addWeeks, addDays, addHours, addMinutes, addSeconds,
         subYears, subMonths, subWeeks, subDays, subHours, subMinutes, subSeconds } from './arithmetic.js';
import { isBefore, isAfter, isSameDay, isSameMonth, isSameYear, isBetween,
         isToday, isYesterday, isTomorrow, isPast, isFuture, isWeekend, isWeekday } from './compare.js';
import { diff, diffInDays, diffInHours, diffInMinutes, diffInMonths, diffInYears } from './diff.js';
import { getYear, getMonth, getDate, getDay, getHours, getMinutes, getSeconds, getMilliseconds, getTime } from './getters.js';
import { startOf, endOf } from './period.js';
import { dayOfYear, weekOfYear, quarter, daysInMonth, isLeapYear } from './utils.js';
import { isBusinessDay, addBusinessDays, subBusinessDays, nextBusinessDay, prevBusinessDay } from './business.js';

export interface DateWrapper {
  date(): Date;
  valueOf(): number;

  // Formatting
  format(template: string, locale?: string): string;
  toISO(): string;
  toISOString(): string;
  toTime(): string;
  relative(options?: RelativeTimeOptions): string;
  formatDate(locale?: string): string;
  formatDateTime(locale?: string): string;
  formatTime(locale?: string): string;

  // Arithmetic
  add(amount: number, unit: Unit): DateWrapper;
  subtract(amount: number, unit: Unit): DateWrapper;
  addYears(n: number): DateWrapper;
  addMonths(n: number): DateWrapper;
  addWeeks(n: number): DateWrapper;
  addDays(n: number): DateWrapper;
  addHours(n: number): DateWrapper;
  addMinutes(n: number): DateWrapper;
  addSeconds(n: number): DateWrapper;
  subYears(n: number): DateWrapper;
  subMonths(n: number): DateWrapper;
  subWeeks(n: number): DateWrapper;
  subDays(n: number): DateWrapper;
  subHours(n: number): DateWrapper;
  subMinutes(n: number): DateWrapper;
  subSeconds(n: number): DateWrapper;

  // Period boundaries
  startOf(unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'): DateWrapper;
  endOf(unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'): DateWrapper;

  // Comparisons
  isBefore(other: DateInput): boolean;
  isAfter(other: DateInput): boolean;
  isSameDay(other: DateInput): boolean;
  isSameMonth(other: DateInput): boolean;
  isSameYear(other: DateInput): boolean;
  isBetween(start: DateInput, end: DateInput): boolean;
  isToday(): boolean;
  isYesterday(): boolean;
  isTomorrow(): boolean;
  isPast(): boolean;
  isFuture(): boolean;
  isWeekend(): boolean;
  isWeekday(): boolean;
  isValid(): boolean;

  // Getters
  year(): number;
  month(): number;
  day(): number;
  weekday(): number;
  hours(): number;
  minutes(): number;
  seconds(): number;
  milliseconds(): number;
  timestamp(): number;
  dayOfYear(): number;
  weekOfYear(): number;
  quarter(): number;
  daysInMonth(): number;
  isLeapYear(): boolean;

  // Difference
  diff(other: DateInput, unit: Unit): number;
  diffInDays(other: DateInput): number;
  diffInHours(other: DateInput): number;
  diffInMinutes(other: DateInput): number;
  diffInMonths(other: DateInput): number;
  diffInYears(other: DateInput): number;

  // Business days
  addBusinessDays(n: number, options?: BusinessDayOptions): DateWrapper;
  subBusinessDays(n: number, options?: BusinessDayOptions): DateWrapper;
  isBusinessDay(options?: BusinessDayOptions): boolean;
  nextBusinessDay(options?: BusinessDayOptions): DateWrapper;
  prevBusinessDay(options?: BusinessDayOptions): DateWrapper;

  // Clone
  clone(): DateWrapper;
}

/**
 * Create a chainable date wrapper (Day.js-like API)
 */
export function d(input?: DateInput): DateWrapper {
  const date = input ? toDate(input) : new Date();

  const wrapper: DateWrapper = {
    date: () => new Date(date.getTime()),
    valueOf: () => date.getTime(),

    // Formatting
    format: (template: string, locale?: string) => formatStr(date, template, locale),
    toISO: () => toISO(date),
    toISOString: () => toISOString(date),
    toTime: () => toTime(date),
    relative: (options?: RelativeTimeOptions) => relative(date, options),
    formatDate: (locale?: string) => formatDate(date, locale),
    formatDateTime: (locale?: string) => formatDateTime(date, locale),
    formatTime: (locale?: string) => formatTime(date, locale),

    // Arithmetic
    add: (amount: number, unit: Unit) => d(add(date, amount, unit)),
    subtract: (amount: number, unit: Unit) => d(subtract(date, amount, unit)),
    addYears: (n: number) => d(addYears(date, n)),
    addMonths: (n: number) => d(addMonths(date, n)),
    addWeeks: (n: number) => d(addWeeks(date, n)),
    addDays: (n: number) => d(addDays(date, n)),
    addHours: (n: number) => d(addHours(date, n)),
    addMinutes: (n: number) => d(addMinutes(date, n)),
    addSeconds: (n: number) => d(addSeconds(date, n)),
    subYears: (n: number) => d(subYears(date, n)),
    subMonths: (n: number) => d(subMonths(date, n)),
    subWeeks: (n: number) => d(subWeeks(date, n)),
    subDays: (n: number) => d(subDays(date, n)),
    subHours: (n: number) => d(subHours(date, n)),
    subMinutes: (n: number) => d(subMinutes(date, n)),
    subSeconds: (n: number) => d(subSeconds(date, n)),

    // Period boundaries
    startOf: (unit) => d(startOf(date, unit)),
    endOf: (unit) => d(endOf(date, unit)),

    // Comparisons
    isBefore: (other: DateInput) => isBefore(date, other),
    isAfter: (other: DateInput) => isAfter(date, other),
    isSameDay: (other: DateInput) => isSameDay(date, other),
    isSameMonth: (other: DateInput) => isSameMonth(date, other),
    isSameYear: (other: DateInput) => isSameYear(date, other),
    isBetween: (start: DateInput, end: DateInput) => isBetween(date, start, end),
    isToday: () => isToday(date),
    isYesterday: () => isYesterday(date),
    isTomorrow: () => isTomorrow(date),
    isPast: () => isPast(date),
    isFuture: () => isFuture(date),
    isWeekend: () => isWeekend(date),
    isWeekday: () => isWeekday(date),
    isValid: () => isValid(date),

    // Getters
    year: () => getYear(date),
    month: () => getMonth(date),
    day: () => getDate(date),
    weekday: () => getDay(date),
    hours: () => getHours(date),
    minutes: () => getMinutes(date),
    seconds: () => getSeconds(date),
    milliseconds: () => getMilliseconds(date),
    timestamp: () => getTime(date),
    dayOfYear: () => dayOfYear(date),
    weekOfYear: () => weekOfYear(date),
    quarter: () => quarter(date),
    daysInMonth: () => daysInMonth(date),
    isLeapYear: () => isLeapYear(date),

    // Difference
    diff: (other: DateInput, unit: Unit) => diff(date, other, unit),
    diffInDays: (other: DateInput) => diffInDays(date, other),
    diffInHours: (other: DateInput) => diffInHours(date, other),
    diffInMinutes: (other: DateInput) => diffInMinutes(date, other),
    diffInMonths: (other: DateInput) => diffInMonths(date, other),
    diffInYears: (other: DateInput) => diffInYears(date, other),

    // Business days
    addBusinessDays: (n: number, options?: BusinessDayOptions) => d(addBusinessDays(date, n, options)),
    subBusinessDays: (n: number, options?: BusinessDayOptions) => d(subBusinessDays(date, n, options)),
    isBusinessDay: (options?: BusinessDayOptions) => isBusinessDay(date, options),
    nextBusinessDay: (options?: BusinessDayOptions) => d(nextBusinessDay(date, options)),
    prevBusinessDay: (options?: BusinessDayOptions) => d(prevBusinessDay(date, options)),

    // Clone
    clone: () => d(date),
  };

  return wrapper;
}
