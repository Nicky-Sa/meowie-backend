import { GENRES } from '../constants/items/genres.constant';

export const getGenreEmoji = (id: number) => {
  return GENRES.find((genre) => genre.id === id)?.emoji ?? '🍿';
};
