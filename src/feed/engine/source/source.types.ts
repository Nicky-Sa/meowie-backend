import { Candidate } from '@/feed/engine/candidate.types';
import { MediaType } from '@/types/media-type';
import { InputResult } from '@/feed/engine/input/input.types';

export type SourceRequest = {
  inputs: readonly InputResult[];
  mediaType: MediaType;
  /** Null starts the source; subsequent values come from its previous batch. */
  cursor: string | null;
};

export type SourceResult = {
  candidates: Candidate[];
  next: { status: 'more'; cursor: string } | { status: 'exhausted' };
};
