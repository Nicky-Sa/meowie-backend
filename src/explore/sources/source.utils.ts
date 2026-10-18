import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { TMDB_BASE_URL } from '@/common/app.constants';

export type SourcePlaceholderValues = {
  today: DateTime;
  country: string;
  language: string;
};

const SOURCE_PLACEHOLDERS: Record<
  string,
  (values: SourcePlaceholderValues) => string
> = {
  today: ({ today }) => today.toUTC().toFormat('yyyy-MM-dd'),
  last_month: ({ today }) =>
    today.toUTC().minus({ months: 1 }).toFormat('yyyy-MM-dd'),
  country: ({ country }) => country,
  language: ({ language }) => language,
};

export const fillSourcePlaceholders = (
  source: string,
  values: SourcePlaceholderValues,
): string =>
  source.replace(/\{([^{}]+)}/g, (_placeholder: string, key: string) => {
    if (!Object.hasOwn(SOURCE_PLACEHOLDERS, key)) {
      throw new BadRequestException(`Unknown source placeholder: {${key}}`);
    }

    return encodeURIComponent(SOURCE_PLACEHOLDERS[key](values));
  });

export const parseSource = (
  source: string,
  page: number,
  values: SourcePlaceholderValues,
) => {
  const filledSource = fillSourcePlaceholders(source, values);

  if (!filledSource.startsWith('/') || filledSource.startsWith('//')) {
    throw new BadRequestException(
      'A source must be a TMDB path starting with /, without the base URL or /3',
    );
  }

  const url = new URL(filledSource, TMDB_BASE_URL);
  const endpoint = url.pathname.slice(1);

  if (!endpoint || endpoint.startsWith('3/') || url.hash) {
    throw new BadRequestException('Invalid TMDB source path');
  }

  return {
    endpoint,
    params: { ...Object.fromEntries(url.searchParams), page: String(page) },
  };
};
