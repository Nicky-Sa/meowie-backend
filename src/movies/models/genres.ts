import { GENRES } from '../../constants/items/genres.constant';

export const getGenreName = (id: number) => {
  return GENRES.find((genre) => genre.id === id)?.name ?? '';
};

export const getGenreEmoji = (id: number) => {
  return GENRES.find((genre) => genre.id === id)?.emoji ?? '';
};

export const searchGenres = (query: string) => {
  return GENRES.filter((genre) =>
    genre.name.toLowerCase().includes(query.toLowerCase()),
  );
};
