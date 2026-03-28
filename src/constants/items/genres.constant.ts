export class Genre {
  id: number;
  name: string;
  emoji: string;
}

export const GENRES: Genre[] = [
  // Movie
  { id: 28, name: 'Action', emoji: '💥' },
  { id: 12, name: 'Adventure', emoji: '🏕️' },
  { id: 14, name: 'Fantasy', emoji: '🧙‍♂️' },
  { id: 36, name: 'History', emoji: '🏛️' },
  { id: 27, name: 'Horror', emoji: '👻' },
  { id: 10402, name: 'Music', emoji: '🎸' },
  { id: 10749, name: 'Romance', emoji: '💖' },
  { id: 878, name: 'Science Fiction', emoji: '👽' },
  { id: 10770, name: 'TV Movie', emoji: '📺' },
  { id: 53, name: 'Thriller', emoji: '🤯' },
  { id: 10752, name: 'War', emoji: '⚔️' },

  // Series
  { id: 10759, name: 'Action & Adventure', emoji: '🦸‍♂️' },
  { id: 10762, name: 'Kids', emoji: '🧸' },
  { id: 10763, name: 'News', emoji: '📰' },
  { id: 10764, name: 'Reality', emoji: '🎥' },
  { id: 10765, name: 'Sci-Fi & Fantasy', emoji: '🚀' },
  { id: 10766, name: 'Soap', emoji: '🧼' },
  { id: 10767, name: 'Talk', emoji: '💬' },
  { id: 10768, name: 'War & Politics', emoji: '⚖️' },

  // Shared
  { id: 16, name: 'Animation', emoji: '🐭' },
  { id: 35, name: 'Comedy', emoji: '😂' },
  { id: 80, name: 'Crime', emoji: '🕵️‍♂️' },
  { id: 99, name: 'Documentary', emoji: '📜' },
  { id: 18, name: 'Drama', emoji: '💔' },
  { id: 10751, name: 'Family', emoji: '🏡' },
  { id: 9648, name: 'Mystery', emoji: '🧚‍♀️' },
  { id: 37, name: 'Western', emoji: '🤠' },
];
