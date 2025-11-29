export const filterKeys = [
  'genres',
  'languages',
  'decade',
  'tmdbRatings',
  'personId',
];

type FilterKeys = (typeof filterKeys)[number];

export type Filters = {
  [key in FilterKeys[number]]?: string;
};

type Page = {
  page: string;
};

type Sort = 'popularity.desc' | 'primary_release_date.desc' | 'random';

export type QueryParams = Filters & Page & { sort: Sort };
