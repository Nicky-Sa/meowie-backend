import {
  AuthorityValue,
  CellKey,
  EraValue,
  OMNIVORE,
  PERSONALITY_CELLS,
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
  COMMITMENT,
  CommitmentAnswer,
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
 * Picks the shareable "You watch like ..." personality from a stored taste
 * profile. PRESENTATION ONLY — never feeds the recommendation taste vector.
 */

export type Personality = {
  name: string;
  source: string;
  description: string;
  rarityPercent: number;
  isOmnivore: boolean;
  // Movie poster of the character's source title, used as the reveal card
  // backdrop. Empty for the omnivore (no single source).
  poster: string;
  flair: string;
};

export type PersonalityInput = {
  movieIds: number[];
  seriesIds: number[];
  era: EraAnswer;
  reality: RealityAnswer;
  tasteAuthority: AuthorityAnswer;
  commitment: CommitmentAnswer;
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

// A 'both' answer on an identity axis is broken by the lean of the user's
// poster picks below. Each tie (or no picks) falls back to what used to be
// the fixed default: new-release / realistic / popular.

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

const IDENTITY_AXES = ['era', 'reality', 'tasteAuthority'] as const;

const flairFor = (commitment: CommitmentAnswer): string => {
  switch (commitment) {
    case COMMITMENT.SHORT:
      return 'Quick-hit watcher';
    case COMMITMENT.LONG:
      return 'Epic binger';
    default:
      return 'Any-length watcher';
  }
};

export const personalityFor = (
  input: PersonalityInput,
  rarityWeights: Record<GenreId, number>,
): Personality => {
  const flair = flairFor(input.commitment);

  const bothCount = IDENTITY_AXES.filter((axis) => input[axis] === BOTH).length;

  if (bothCount >= 2) {
    return {
      name: OMNIVORE.default.name,
      source: OMNIVORE.default.source,
      description: OMNIVORE.description,
      rarityPercent: OMNIVORE.rarityPercent,
      isOmnivore: true,
      poster: '',
      flair,
    };
  }

  const picks = pickedTitles(input.movieIds, input.seriesIds);

  const era = input.era === BOTH ? eraFromPicks(picks) : input.era;
  const reality =
    input.reality === BOTH ? realityFromPicks(picks) : input.reality;
  const authority =
    input.tasteAuthority === BOTH
      ? authorityFromPicks(picks)
      : input.tasteAuthority;

  const cellKey: CellKey = `${era}_${reality}_${authority}`;
  const cell = PERSONALITY_CELLS[cellKey];

  const top = topGenre(picks, rarityWeights);
  const character = (top !== null && cell.byGenre[top]) || cell.default;

  return {
    name: character.name,
    source: character.source,
    description: cell.description,
    rarityPercent: cell.rarityPercent,
    isOmnivore: false,
    poster: character.poster,
    flair,
  };
};
