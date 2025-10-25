import { OMDB_Source } from './thirdparty/omdb';

type RatingEntry = {
  source: OMDB_Source | 'The Movie Database';
  value: string;
}[];

export type AllRatings = {
  ratings: RatingEntry;
};
