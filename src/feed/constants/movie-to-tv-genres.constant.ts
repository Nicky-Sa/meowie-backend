/**
 * The taste wizard's genre chips use TMDB movie genre ids, but TMDB TV
 * has its own genre list and several movie genres have no TV counterpart.
 * Series discovery and scoring translate through this table.
 *
 * No TV equivalent exists for Horror (27), Thriller (53), Music (10402),
 * History (36), or Romance (10749) — those chips don't constrain series at
 * all. Shared ids (Animation, Comedy, Crime, Documentary, Drama, Family,
 * Mystery, Western) map to themselves.
 */
export const MOVIE_TO_TV_GENRE_IDS: Record<number, number[]> = {
  28: [10759], // Action → Action & Adventure
  12: [10759], // Adventure → Action & Adventure
  878: [10765], // Science Fiction → Sci-Fi & Fantasy
  14: [10765], // Fantasy → Sci-Fi & Fantasy
  10752: [10768], // War → War & Politics
  16: [16], // Animation
  35: [35], // Comedy
  80: [80], // Crime
  99: [99], // Documentary
  18: [18], // Drama
  10751: [10751], // Family
  9648: [9648], // Mystery
  37: [37], // Western
};

/** The TV genre ids that match the given movie genre ids. */
export const tvGenreIdsFor = (genreIds: number[]): number[] => [
  ...new Set(genreIds.flatMap((id) => MOVIE_TO_TV_GENRE_IDS[id] ?? [])),
];

/** The given movie genre ids plus their TV matches, for candidate scoring. */
export const addTvGenreIds = (genreIds: number[]): Set<number> =>
  new Set([...genreIds, ...tvGenreIdsFor(genreIds)]);
