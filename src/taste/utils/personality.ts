import {
  AuthorityValue,
  EraValue,
  EVERYTHING_CAT,
  GroupKey,
  Personality,
  PersonalityGroup,
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
  ERA,
  EraAnswer,
  idsAnswered,
  RARITY_WEIGHTS,
  REALITY,
  RealityAnswer,
  TitleRatings,
  AUTHORITY,
} from '@/taste/constants/journey.constant';

export type PersonalityInput = {
  movieRatings: TitleRatings;
  seriesRatings: TitleRatings;
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

const likedTitles = (input: PersonalityInput): Title[] =>
  [
    ...idsAnswered(input.movieRatings, 'like').map((tmdbId) =>
      movieByTmdbId.get(tmdbId),
    ),
    ...idsAnswered(input.seriesRatings, 'like').map((tmdbId) =>
      seriesByTmdbId.get(tmdbId),
    ),
  ].filter((title): title is Title => title !== undefined);

/**
 * The genre the user leant on most. Every title they liked votes once, for its
 * main genre. Ties go to the rarer genre, so a common one can't win by being
 * everywhere.
 */
const topGenre = (liked: Title[]): GenreId | null => {
  const counts = new Map<GenreId, number>();
  for (const genre of liked.map((title) => title.mainGenreId)) {
    counts.set(genre, (counts.get(genre) ?? 0) + 1);
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

type GroupSides = {
  era: EraValue;
  reality: RealityValue;
  authority: AuthorityValue;
};

// Answered sides first, so a group that matches nothing — every answer was
// 'no preference' — still lands on the popular-modern side it always used to.
const ERA_SIDES = [ERA.NEW_RELEASE, ERA.CLASSIC];
const REALITY_SIDES = [REALITY.REALISTIC, REALITY.FANTASY];
const AUTHORITY_SIDES = [AUTHORITY.POPULAR, AUTHORITY.CRITICS_CHOICE];

const ALL_GROUP_SIDES: GroupSides[] = ERA_SIDES.flatMap((era) =>
  REALITY_SIDES.flatMap((reality) =>
    AUTHORITY_SIDES.map((authority) => ({ era, reality, authority })),
  ),
);

const groupFor = (sides: GroupSides): PersonalityGroup => {
  const key: GroupKey = `${sides.era}_${sides.reality}_${sides.authority}`;
  return PERSONALITY_GROUPS[key];
};

const answersMatched = (sides: GroupSides, input: PersonalityInput): number =>
  (sides.era === input.era ? 1 : 0) +
  (sides.reality === input.reality ? 1 : 0) +
  (sides.authority === input.authority ? 1 : 0);

/**
 * Groups the user's answers agree with most, first. A 'no preference' answer
 * matches neither side, so it steps aside and lets the others decide.
 */
const groupsByAnswers = (input: PersonalityInput): PersonalityGroup[] =>
  [...ALL_GROUP_SIDES]
    .sort(
      (one, other) => answersMatched(other, input) - answersMatched(one, input),
    )
    .map(groupFor);

/**
 * Picks the shareable cat card. The top genre leads: the closest group that has
 * a cat for it wins, and the answers only choose between that genre's cats.
 * Commitment plays no part — it only steers the feed.
 */
export const personalityFor = (input: PersonalityInput): Personality => {
  if (
    input.era === BOTH &&
    input.reality === BOTH &&
    input.authority === BOTH
  ) {
    return EVERYTHING_CAT;
  }

  const groups = groupsByAnswers(input);
  const top = topGenre(likedTitles(input));

  const catForGenre =
    top === null
      ? undefined
      : groups.map((group) => group.byGenre[top]).find((cat) => cat);

  return catForGenre ?? groups[0].default;
};
