import { Title } from '@/taste/constants/pools.constant';

const shuffled = <TItem>(items: TItem[]): TItem[] => {
  const mixed = [...items];
  for (let i = mixed.length - 1; i > 0; i--) {
    const swapWith = Math.floor(Math.random() * (i + 1));
    [mixed[i], mixed[swapWith]] = [mixed[swapWith], mixed[i]];
  }
  return mixed;
};

/**
 * Gives every user a different order without losing the genre spread. A pool is
 * two rounds of one title per genre, so each round is shuffled on its own and
 * they stay in order — the first cards still cover every genre exactly once.
 */
export const shuffledPool = (pool: Title[]): Title[] => {
  const roundSize = Math.ceil(pool.length / 2);
  return [
    ...shuffled(pool.slice(0, roundSize)),
    ...shuffled(pool.slice(roundSize)),
  ];
};
