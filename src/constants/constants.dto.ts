import { ChurnReason } from '@/constants/items/churn-reasons.constant';

export class ChurnReasonsResDto {
  reasons: ChurnReason[];
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
