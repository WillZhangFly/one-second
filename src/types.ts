/**
 * Types for one-second date library
 */

export type DateInput = Date | string | number;

export interface FormatOptions {
  locale?: string;
  weekday?: 'long' | 'short' | 'narrow';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
  timeZone?: string;
}

export interface RelativeTimeOptions {
  locale?: string;
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
}

export type Unit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';

export interface Duration {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  asMilliseconds: () => number;
  asSeconds: () => number;
  asMinutes: () => number;
  asHours: () => number;
  asDays: () => number;
  asWeeks: () => number;
  humanize: (locale?: string) => string;
}

export interface BusinessDayOptions {
  weekendDays?: number[];  // Default: [0, 6] (Sunday, Saturday)
  holidays?: DateInput[];  // Specific dates to exclude
}

export interface Interval {
  start: Date;
  end: Date;
  contains(date: DateInput): boolean;
  overlaps(other: Interval): boolean;
  eachDay(): Generator<Date>;
  eachWeek(): Generator<Date>;
  eachMonth(): Generator<Date>;
  duration(): Duration;
  days(): number;
  isValid(): boolean;
}
