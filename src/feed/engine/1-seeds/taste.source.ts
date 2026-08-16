import {
  TASTE_DISLIKE_SEED_WEIGHT,
  TASTE_LIKE_SEED_WEIGHT,
} from '@/feed/engine/constants/feed.constant';
import {
  TasteSourceInput,
  TasteSourceOutput,
} from '@/feed/engine/1-seeds/taste.types';

/**
 * Turns taste-deck answers into seeds.
 *
 * `like` and `dislike` become fixed positive and negative weights. `not-seen`
 * is ignored because it gives us no information about the user's taste.
 */
export const tasteSource = ({
  tasteRatings,
}: TasteSourceInput): TasteSourceOutput =>
  Object.entries(tasteRatings)
    .filter(([, answer]) => answer !== 'not-seen')
    .map(([id, answer]) => ({
      id: Number(id),
      weight:
        answer === 'like' ? TASTE_LIKE_SEED_WEIGHT : TASTE_DISLIKE_SEED_WEIGHT,
    }));
