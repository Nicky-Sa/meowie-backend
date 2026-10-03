import { Injectable } from '@nestjs/common';
import {
  ScoringRequest,
  ScoringResult,
} from '@/feed/engine/scoring/scoring.types';

@Injectable()
export abstract class ScoringService {
  protected constructor() {}

  abstract score(request: ScoringRequest): Promise<ScoringResult>;
}
