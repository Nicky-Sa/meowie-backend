export type WeightedId = {
  id: number;
  weight: number;
};

export type FeedProfileContribution = {
  keywordIds: WeightedId[];
  genreIds: WeightedId[];
  libraryMovieIds: WeightedId[];
  librarySeriesIds: WeightedId[];
};

export type FeedProfile = {
  keywordIds: WeightedId[];
  genreIds: WeightedId[];
  libraryMovieIds: WeightedId[];
  librarySeriesIds: WeightedId[];
};
