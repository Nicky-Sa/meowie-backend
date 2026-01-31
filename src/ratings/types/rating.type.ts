export const RATING_SOURCES = [
  'IMDb',
  'Rotten Tomatoes',
  'Metacritic',
  'TMDB',
] as const;

export type Rating_Source = (typeof RATING_SOURCES)[number];

export class RatingEntry {
  source: Rating_Source;
  value: string;
}
