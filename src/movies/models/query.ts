export const filterKeys = ['genres', 'languages', 'decade', 'tmdbRatings'];

type FilterKeys = (typeof filterKeys)[number];

export type Filters = {
  [key in FilterKeys[number]]?: string;
};

type Page = {
  page: string;
};

export type QueryParams = Filters &
  Page & {
    noFilters?: string; // to check for the initial tmdbRatings value
  };
