import {
  AuthorityValue,
  Character,
  GroupKey,
  EraValue,
  EVERYTHING_CAT,
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
  ESCAPIST_GENRE_IDS,
  EraAnswer,
  GROUNDED_GENRE_IDS,
  MODERN_MIN_YEAR,
  REALITY,
  RealityAnswer,
  TASTE_AUTHORITY,
} from '@/taste/constants/journey.constant';

/**
 * Picks the shareable cat card from a stored taste profile.
 * PRESENTATION ONLY — never feeds the recommendation taste vector.
 */

// The picked cat: `image` is the finished share card (all of its wording is
// drawn into the picture), `name` is only for the share message.
export type Personality = Character;

export type PersonalityInput = {
  movieIds: number[];
  seriesIds: number[];
  era: EraAnswer;
  reality: RealityAnswer;
  tasteAuthority: AuthorityAnswer;
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

/**
 * Highest-count genre across all selected titles (movies + series combined).
 * Tie-break: higher rarity weight (more distinctive) wins. Null when no picks
 * or none of the ids are in the seed pools.
 */
const topGenre = (
  picks: Title[],
  rarityWeights: Record<GenreId, number>,
): GenreId | null => {
  const counts = new Map<GenreId, number>();
  for (const pick of picks) {
    for (const genre of pick.genreIds) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }

  let best: GenreId | null = null;
  let bestCount = -1;
  let bestWeight = -1;
  for (const [genre, count] of counts) {
    const weight = rarityWeights[genre] ?? 1;
    if (count > bestCount || (count === bestCount && weight > bestWeight)) {
      best = genre;
      bestCount = count;
      bestWeight = weight;
    }
  }
  return best;
};

// A 'both' answer on one of the three main questions is decided by the lean of
// the user's poster picks below. Each tie (or no picks) falls back to what used
// to be the fixed default: new-release / realistic / popular.

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
  genreHits(picks, ESCAPIST_GENRE_IDS) > genreHits(picks, GROUNDED_GENRE_IDS)
    ? REALITY.FANTASY
    : REALITY.REALISTIC;

const authorityFromPicks = (picks: Title[]): AuthorityValue => {
  const hiddenGems = picks.filter((pick) => pick.hiddenGem).length;
  return hiddenGems * 2 > picks.length
    ? TASTE_AUTHORITY.CRITICS_CHOICE
    : TASTE_AUTHORITY.POPULAR;
};

// The three questions that decide which group of cats the user lands in.
// Commitment is not one of them — it only steers the feed.
const MAIN_QUESTIONS = ['era', 'reality', 'tasteAuthority'] as const;

export const personalityFor = (
  input: PersonalityInput,
  rarityWeights: Record<GenreId, number>,
): Personality => {
  const bothCount = MAIN_QUESTIONS.filter(
    (question) => input[question] === BOTH,
  ).length;

  if (bothCount >= 2) {
    return EVERYTHING_CAT;
  }

  const picks = pickedTitles(input.movieIds, input.seriesIds);

  const era = input.era === BOTH ? eraFromPicks(picks) : input.era;
  const reality =
    input.reality === BOTH ? realityFromPicks(picks) : input.reality;
  const authority =
    input.tasteAuthority === BOTH
      ? authorityFromPicks(picks)
      : input.tasteAuthority;

  const key: GroupKey = `${era}_${reality}_${authority}`;
  const group = PERSONALITY_GROUPS[key];

  const top = topGenre(picks, rarityWeights);
  return (top !== null && group.byGenre[top]) || group.default;
};
