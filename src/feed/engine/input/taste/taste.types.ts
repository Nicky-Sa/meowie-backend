import { Candidate } from '@/feed/engine/candidate.types';

export type TasteInputResult = {
  type: 'taste';
  titles: {
    liked: Candidate[];
    disliked: Candidate[];
  };
};
