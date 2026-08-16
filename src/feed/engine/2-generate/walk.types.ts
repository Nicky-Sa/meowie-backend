import { Seed } from '@/feed/engine/1-seeds/seed.types';

export type WalkInput = {
  seeds: Seed[];
  getNeighbours: (id: number) => Promise<number[]>;
};

export type WalkedTitle = {
  id: number;
  weight: number;
};

export type WalkOutput = WalkedTitle[];

type Id = number; // movie or series id
export type Weights = Map<Id, number>;
