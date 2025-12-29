import { OMDB_Source } from '../../models/thirdparty/omdb';

export class RatingEntry {
  source: OMDB_Source | 'The Movie Database';
  value: string;
}
