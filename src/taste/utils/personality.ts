import {
  Cat,
  CATS,
  EVERYTHING_CAT,
  Personality,
  Trait,
} from '@/taste/constants/personality.constant';
import {
  GenreId,
  MOVIES,
  SERIES,
  Title,
} from '@/taste/constants/pools.constant';
import {
  AuthorityAnswer,
  EraAnswer,
  idsAnswered,
  RARITY_WEIGHTS,
  TitleRatings,
} from '@/taste/constants/journey.constant';

export type PersonalityInput = {
  movieRatings: TitleRatings;
  seriesRatings: TitleRatings;
  era: EraAnswer;
  authority: AuthorityAnswer;
};

// Movie and series TMDB ids are separate namespaces that can collide, so each
// pool gets its own lookup.
const poolByTmdbId = (pool: Title[]): Map<number, Title> =>
  new Map(pool.map((title) => [title.tmdbId, title]));

const movieByTmdbId = poolByTmdbId(MOVIES);
const seriesByTmdbId = poolByTmdbId(SERIES);

const titlesAnswered = (
  input: PersonalityInput,
  answer: Parameters<typeof idsAnswered>[1],
): Title[] =>
  [
    ...idsAnswered(input.movieRatings, answer).map((tmdbId) =>
      movieByTmdbId.get(tmdbId),
    ),
    ...idsAnswered(input.seriesRatings, answer).map((tmdbId) =>
      seriesByTmdbId.get(tmdbId),
    ),
  ].filter((title): title is Title => title !== undefined);

/**
 * How much of what the user liked sits in these genres. Rare genres count for
 * more, so a handful of westerns beats a pile of drama.
 */
const genreFit = (liked: Title[], genres: GenreId[]): number => {
  let matched = 0;
  let total = 0;
  for (const title of liked) {
    const weight = RARITY_WEIGHTS[title.mainGenreId] ?? 1;
    total += weight;
    if (genres.includes(title.mainGenreId)) matched += weight;
  }
  return total === 0 ? 0 : matched / total;
};

const HARD_TO_PLEASE_SHARE = 0.6;
const EASY_GOING_SHARE = 0.7;
const LOTS_LEFT_SHARE = 0.5;

/**
 * What the way they rated says about them. Only one trait can hold, and the
 * strongest reading wins: a deck full of skips beats a like/dislike split.
 */
const traitFrom = (input: PersonalityInput): Trait | null => {
  const answers = [
    ...Object.values(input.movieRatings),
    ...Object.values(input.seriesRatings),
  ];
  if (answers.length === 0) return null;

  const notSeen = answers.filter((answer) => answer === 'not-seen').length;
  if (notSeen / answers.length >= LOTS_LEFT_SHARE) return 'lots-left-to-watch';

  const likes = answers.filter((answer) => answer === 'like').length;
  const opinions = answers.length - notSeen;
  if (opinions === 0) return null;

  if (likes / opinions >= EASY_GOING_SHARE) return 'easy-going';
  if (1 - likes / opinions >= HARD_TO_PLEASE_SHARE) return 'hard-to-please';
  return null;
};

// The genres lead — they say the most about a person — and the two answers and
// the trait only choose between cats that already fit the genres.
const GENRE_WEIGHT = 3;
const TRAIT_WEIGHT = 1.5;
const ANSWER_WEIGHT = 1;

// A cat that stands for one way of rating counts against a user who rates the
// other way, or the trait would only ever break ties.
const traitScore = (cat: Cat, trait: Trait | null): number => {
  if (cat.trait === undefined || trait === null) return 0;
  return cat.trait === trait ? TRAIT_WEIGHT : -TRAIT_WEIGHT;
};

const scoreFor = (
  cat: Cat,
  input: PersonalityInput,
  liked: Title[],
  disliked: Title[],
  trait: Trait | null,
): number =>
  GENRE_WEIGHT * genreFit(liked, cat.genres) -
  GENRE_WEIGHT * genreFit(disliked, cat.genres) +
  (cat.era === input.era ? ANSWER_WEIGHT : 0) +
  (cat.authority === input.authority ? ANSWER_WEIGHT : 0) +
  traitScore(cat, trait);

/**
 * Equal scores are broken by the rarer cat, then by the one standing for fewer
 * genres — without that, a cat covering two genres shadows the cat that covers
 * only one of them and the narrow cat could never be given out.
 */
const beats = (
  cat: Cat,
  score: number,
  best: Cat,
  bestScore: number,
): boolean =>
  score > bestScore ||
  (score === bestScore &&
    (cat.rarity > best.rarity ||
      (cat.rarity === best.rarity && cat.genres.length < best.genres.length)));

/**
 * Picks the shareable cat card: the one that fits the deck and the answers
 * best. A user who liked nothing and took no side gets the cat that stands for
 * everything.
 */
export const personalityFor = (input: PersonalityInput): Personality => {
  const liked = titlesAnswered(input, 'like');
  const disliked = titlesAnswered(input, 'dislike');
  const trait = traitFrom(input);

  let best: Cat | null = null;
  let bestScore = 0;
  for (const cat of CATS) {
    const score = scoreFor(cat, input, liked, disliked, trait);
    if (
      best === null ? score > bestScore : beats(cat, score, best, bestScore)
    ) {
      best = cat;
      bestScore = score;
    }
  }

  return best ?? EVERYTHING_CAT;
};
