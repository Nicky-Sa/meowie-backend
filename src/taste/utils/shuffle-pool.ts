import { GenreId, Title } from '@/taste/constants/pools.constant';

const shuffled = <TItem>(items: TItem[]): TItem[] => {
  const mixed = [...items];
  for (let i = mixed.length - 1; i > 0; i--) {
    const swapWith = Math.floor(Math.random() * (i + 1));
    [mixed[i], mixed[swapWith]] = [mixed[swapWith], mixed[i]];
  }
  return mixed;
};

/**
 * A different order for every user without losing the genre spread: each
 * genre's titles are shuffled, then dealt one genre at a time. The first cards
 * therefore cover as many genres as the pool holds before any genre repeats,
 * whatever the counts per genre are.
 */
export const shuffledPool = (pool: Title[]): Title[] => {
  const byGenre = new Map<GenreId, Title[]>();
  for (const title of pool) {
    byGenre.set(title.mainGenreId, [
      ...(byGenre.get(title.mainGenreId) ?? []),
      title,
    ]);
  }

  const piles = shuffled([...byGenre.values()]);
  const deepestPile = Math.max(0, ...piles.map((pile) => pile.length));

  const dealt: Title[] = [];
  for (let round = 0; round < deepestPile; round++) {
    for (const pile of piles) {
      if (round < pile.length) dealt.push(pile[round]);
    }
  }
  return dealt;
};
