type Filters = {
  genres: string;
  languages: string;
  decade: string;
  tmdbRatings: string;
};

export type QueryParams = Filters & {
  page: string;
};
