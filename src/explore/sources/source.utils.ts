import { BadRequestException } from '@nestjs/common';
import { TMDB_BASE_URL } from '@/common/app.constants';
import { PaginatedResponse } from '@/common/types/paginated-response';
import {
  DiscoveredTitle,
  ExtraSourceFilter,
  ParsedExtraSourceFilter,
  SourcePlaceholderValues,
} from '@/explore/sources/source.types';
import { DATE_UNITS, toTmdbDate } from '@/utils/dates';

// Our own filters for things TMDB can't filter on. TMDB never gets these params.
const EXTRA_FILTERS: ExtraSourceFilter[] = [
  {
    name: 'min_popularity',
    keepTitle: (title, limit) => title.popularity >= limit,
    cutsPagesWhenSortedBy: 'popularity.desc',
  },
];

export const splitSourceParams = (params: Record<string, string>) => {
  const tmdbParams: Record<string, string> = {};
  const parsedExtraSourceFilters: ParsedExtraSourceFilter[] = [];

  for (const [key, value] of Object.entries(params)) {
    const extraSourceFilter = EXTRA_FILTERS.find(
      (filter) => filter.name === key,
    );

    if (extraSourceFilter) {
      parsedExtraSourceFilters.push({
        extraSourceFilter,
        limit: Number(value),
      });
    } else {
      tmdbParams[key] = value;
    }
  }

  return { tmdbParams, parsedExtraSourceFilters };
};

export const passesExtraFilters = (
  title: DiscoveredTitle,
  parsedExtraSourceFilters: ParsedExtraSourceFilter[],
): boolean =>
  parsedExtraSourceFilters.every(({ extraSourceFilter, limit }) =>
    extraSourceFilter.keepTitle(title, limit),
  );

/** Only a filter on the field the list is sorted by can show where the useful pages end */
export const findLastPage = (
  response: PaginatedResponse<DiscoveredTitle>,
  parsedExtraSourceFilters: ParsedExtraSourceFilter[],
  sortBy: string | undefined,
): number => {
  const cuttingFilters = parsedExtraSourceFilters.filter(
    ({ extraSourceFilter }) =>
      extraSourceFilter.cutsPagesWhenSortedBy === sortBy,
  );
  const reachedLimit = response.results.some(
    (title) => !passesExtraFilters(title, cuttingFilters),
  );

  return reachedLimit ? response.page : response.total_pages;
};

const SOURCE_PLACEHOLDERS: {
  pattern: RegExp;
  fill: (match: RegExpExecArray, values: SourcePlaceholderValues) => string;
}[] = [
  { pattern: /^today$/, fill: (_match, { today }) => toTmdbDate(today) },
  {
    // e.g. {+3months} is 3 months from today, {-2weeks} is 2 weeks ago
    pattern: new RegExp(
      `^(?<sign>[+-])(?<amount>\\d+)(?<unit>${DATE_UNITS.join('|')})$`,
    ),
    fill: ({ groups }, { today }) => {
      const { sign, amount, unit } = groups as {
        sign: '+' | '-';
        amount: string;
        unit: (typeof DATE_UNITS)[number];
      };
      const distance = { [unit]: Number(amount) };
      const date = sign === '+' ? today.plus(distance) : today.minus(distance);

      return toTmdbDate(date);
    },
  },
  { pattern: /^country$/, fill: (_match, { country }) => country },
  { pattern: /^language$/, fill: (_match, { language }) => language },
];

export const fillSourcePlaceholders = (
  source: string,
  values: SourcePlaceholderValues,
): string =>
  source.replace(/\{([^{}]+)}/g, (_placeholder: string, key: string) => {
    for (const { pattern, fill } of SOURCE_PLACEHOLDERS) {
      const match = pattern.exec(key);

      if (match) {
        return encodeURIComponent(fill(match, values));
      }
    }

    throw new BadRequestException(`Unknown source placeholder: {${key}}`);
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
