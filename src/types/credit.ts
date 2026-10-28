export type CreditJob = 'cast' | 'crew' | 'director' | 'creator';

export class CreditInfo {
  id: number;
  name: string;
  // The text shown under the name: the character for cast, the TMDB job for everyone else.
  role: string;
  job: CreditJob;
  creditId: string;
  profilePath: string;
}
