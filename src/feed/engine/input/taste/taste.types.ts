import { Title } from '@/feed/engine/engine.types';

export type TasteInputResult = {
  type: 'taste';
  weight: number;
  titles: {
    liked: Title[];
    disliked: Title[];
  };
};
