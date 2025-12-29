import { ChurnReason } from './items/churn-reasons.constant';
import { Genre } from './items/genres.constant';

export class ChurnReasonsResDto {
  reasons: ChurnReason[];
}

export class GenresResDto {
  genres: Genre[];
}
