import {
  AuthorityValue,
  EraValue,
  EVERYTHING_CAT,
  GroupKey,
  Personality,
  PERSONALITY_GROUPS,
  RealityValue,
} from '@/taste/constants/personality.constant';
import {
  GenreId,
  MOVIES,
  SERIES,
  Title,
} from '@/taste/constants/pools.constant';
import {
  AuthorityAnswer,
  BOTH,
  CLASSIC_MAX_YEAR,
  ERA,
  FANTASY_GENRE_IDS,
  EraAnswer,
  REALISTIC_GENRE_IDS,
  MODERN_MIN_YEAR,
  RARITY_WEIGHTS,
  REALITY,
  RealityAnswer,
  AUTHORITY,
} from '@/taste/constants/journey.constant';

export type PersonalityInput = {
  movieIds: number[];
  seriesIds: number[];
  genreIds: GenreId[];
  era: EraAnswer;
  reality: RealityAnswer;
  authority: AuthorityAnswer;
};

// Movie and series TMDB ids are separate namespaces that can collide, so each
// pool gets its own lookup.
const poolByTmdbId = (pool: Title[]): Map<number, Title> =>
  new Map(pool.map((title) => [title.tmdbId, title]));

const movieByTmdbId = poolByTmdbId(MOVIES);
const seriesByTmdbId = poolByTmdbId(SERIES);

const pickedTitles = (movieIds: number[], seriesIds: number[]): Title[] =>
  [
    ...movieIds.map((tmdbId) => movieByTmdbId.get(tmdbId)),
    ...seriesIds.map((tmdbId) => seriesByTmdbId.get(tmdbId)),
  ].filter((title): title is Title => title !== undefined);

// A tapped genre chip is a direct statement of taste, while a title carries
// three genres it did not choose, so a chip counts for more than one title.
const GENRE_CHIP_WEIGHT = 2;

/** Ties go to the rarer genre, so a common one can't win by being everywhere. */
const topGenre = (picks: Title[], chipGenreIds: GenreId[]): GenreId | null => {
  const counts = new Map<GenreId, number>();
  for (const pick of picks) {
    for (const genre of pick.genreIds) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  for (const genre of chipGenreIds) {
    counts.set(genre, (counts.get(genre) ?? 0) + GENRE_CHIP_WEIGHT);
  }

  let best: GenreId | null = null;
  let bestCount = -1;
  let bestWeight = -1;
  for (const [genre, count] of counts) {
    const weight = RARITY_WEIGHTS[genre] ?? 1;
    if (count > bestCount || (count === bestCount && weight > bestWeight)) {
      best = genre;
      bestCount = count;
      bestWeight = weight;
    }
  }
  return best;
};

// Every 'both' answer is read from the picks instead. Each tie (or no picks)
// falls back to new-release / realistic / popular.

const eraFromPicks = (picks: Title[]): EraValue => {
  const classic = picks.filter((pick) => pick.year <= CLASSIC_MAX_YEAR).length;
  const modern = picks.filter((pick) => pick.year >= MODERN_MIN_YEAR).length;
  return classic > modern ? ERA.CLASSIC : ERA.NEW_RELEASE;
};

const genreHits = (picks: Title[], family: GenreId[]): number =>
  picks
    .flatMap((pick) => pick.genreIds)
    .filter((genre) => family.includes(genre)).length;

const realityFromPicks = (picks: Title[]): RealityValue =>
  genreHits(picks, FANTASY_GENRE_IDS) > genreHits(picks, REALISTIC_GENRE_IDS)
    ? REALITY.FANTASY
    : REALITY.REALISTIC;

const authorityFromPicks = (picks: Title[]): AuthorityValue => {
  const hiddenGems = picks.filter((pick) => pick.hiddenGem).length;
  return hiddenGems * 2 > picks.length
    ? AUTHORITY.CRITICS_CHOICE
    : AUTHORITY.POPULAR;
};

/**
 * Picks the shareable cat card. Commitment plays no part — it only steers the
 * feed.
 */
export const personalityFor = (input: PersonalityInput): Personality => {
  if (
    input.era === BOTH &&
    input.reality === BOTH &&
    input.authority === BOTH
  ) {
    return EVERYTHING_CAT;
  }

  const picks = pickedTitles(input.movieIds, input.seriesIds);

  const era = input.era === BOTH ? eraFromPicks(picks) : input.era;
  const reality =
    input.reality === BOTH ? realityFromPicks(picks) : input.reality;
  const authority =
    input.authority === BOTH ? authorityFromPicks(picks) : input.authority;

  const key: GroupKey = `${era}_${reality}_${authority}`;
  const group = PERSONALITY_GROUPS[key];

  const top = topGenre(picks, input.genreIds);
  const catForGenre = top === null ? undefined : group.byGenre[top];
  return catForGenre ?? group.default;
};
