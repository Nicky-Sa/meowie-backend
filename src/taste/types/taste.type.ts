import { FlexibilityOptionId } from '@/taste/constants/flexibility-options.constant';

/**
 * Stored taste resolved into ids the discovery layer can use: the TMDB keyword
 * ids and genre ids derived from the encoded `KeywordId`s, plus flexibility.
 */
export type ResolvedTaste = {
  keywordIds: number[];
  genreIds: number[];
  flexibility: FlexibilityOptionId;
};
