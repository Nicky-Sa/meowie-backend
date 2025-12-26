export const filterKeys = ['genres', 'languages', 'decade', 'tmdbRatings'];

type FilterKeys = (typeof filterKeys)[number];

export type Filters = {
  [key in FilterKeys[number]]?: string;
};

type Page = {
  page: string;
};

type Sort = 'popularity.desc' | 'primary_release_date.desc' | 'random';

// Browse include items that don't have an individual modifier in the filters page,
// but can still be used to filter results
type Browse = {
  personId: string;
};

// Search params = anything that can be used to filter results.
export type SearchParams = Filters & Browse;

export type QueryParams = SearchParams & Page & { sort: Sort };

export const hasFilters = (query: QueryParams): boolean => {
  const queryKeys = Object.keys(query);
  return queryKeys.some((key) => {
    return filterKeys.includes(key);
  });
};
