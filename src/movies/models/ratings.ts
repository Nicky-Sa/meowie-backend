import { OMDB_Source } from '../../models/thirdparty/omdb';

type RatingEntry = {
  source: OMDB_Source | 'The Movie Database';
  value: string;
}[];

export type AllRatings = {
  ratings: RatingEntry;
};
