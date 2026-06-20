import { ChurnReason } from '@/constants/items/churn-reasons.constant';
import { TasteGenre } from '@/constants/items/taste-keywords.constant';
import { FlexibilityOption } from '@/constants/items/flexibility-options.constant';

export class ChurnReasonsResDto {
  reasons: ChurnReason[];
}

export class TasteItemsResDto {
  tasteGenres: TasteGenre[];
}

export class FlexibilityOptionsResDto {
  flexibilityOptions: FlexibilityOption[];
}

// the Genre type previously from items/genres.constant.ts has been copied here, or we can just import it. Let's define it here.
export class Genre {
  id: number;
  name: string;
  emoji: string;
}

export class GenresResDto {
  movieGenres: Genre[];
  seriesGenres: Genre[];
}
