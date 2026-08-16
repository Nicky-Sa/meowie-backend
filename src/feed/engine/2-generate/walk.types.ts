import { Seed } from '@/feed/engine/engine.type';

export type WalkSourceInput = {
  seeds: Seed[];
  getNeighbours: (id: number) => Promise<number[]>;
};

export type WalkedTitle = {
  id: number;
  weight: number;
};

export type WalkSourceOutput = WalkedTitle[];

type Id = number; // movie or series id
export type Weights = Map<Id, number>;
