import { Title } from '@/feed/engine/engine.types';

export type TasteInputResult = {
  type: 'taste';
  titles: {
    liked: Title[];
    disliked: Title[];
  };
};
