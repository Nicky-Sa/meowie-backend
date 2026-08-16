import { MediaType } from '@/types/media-type';

type PopularTitle = {
  id: number;
  genreIds: number[];
  voteCount: number;
};

export type PopularMovieTitle = PopularTitle & {
  runtimeMinutes: number;
};

export type PopularSeriesTitle = PopularTitle;

export type PopularSourceInput =
  | {
      mediaType: 'movie';
      titles: PopularMovieTitle[];
    }
  | {
      mediaType: 'series';
      titles: PopularSeriesTitle[];
    };

export type PopularCandidate =
  | (PopularMovieTitle & {
      mediaType: Extract<MediaType, 'movie'>;
      isPopular: true;
    })
  | (PopularSeriesTitle & {
      mediaType: Extract<MediaType, 'series'>;
      isPopular: true;
    });

export type PopularSourceOutput = PopularCandidate[];
