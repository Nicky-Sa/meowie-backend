import { DateTime } from 'luxon';

export const DATE_UNITS = ['days', 'weeks', 'months', 'years'] as const;

export const extractYearFromDate = (date: string | null | undefined) => {
  if (!date) {
    return 'N/A';
  }
  return new Date(date).getFullYear().toString();
};

export const toTmdbDate = (date: DateTime): string =>
  date.toUTC().toFormat('yyyy-MM-dd');
