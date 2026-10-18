import { Injectable } from '@nestjs/common';
import { PosterResDto } from '@/common/dto/poster.dto';
import { GENRES } from '@/constants/items/genres.constant';
import {
  parseSource,
  SourcePlaceholderValues,
} from '@/explore/sources/source.utils';
import { ImagesService } from '@/images/images.service';
import { getImageWithFallback } from '@/images/images.utils';
import { PosterInfo } from '@/images/poster';
import { TmdbService } from '@/tmdb/tmdb.service';
import {
  TMDB_DiscoveredMovieDetail,
  TMDB_DiscoveredSeriesDetail,
} from '@/tmdb/tmdb.type';
import { isMovie } from '@/utils/media';

@Injectable()
export class ExploreSourceService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly imagesService: ImagesService,
  ) {}

  async getSourcePage(
    source: string,
    page: number,
    values: Omit<SourcePlaceholderValues, 'today'>,
  ): Promise<PosterResDto> {
    const { endpoint, params } = parseSource(source, page, values);
    const response = await this.tmdbService.getList<
      TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail
    >(endpoint, params);

    const results = this.filterLowQualityTitles(
      response.results,
    ).map<PosterInfo>((title) => {
      const mediaType = isMovie(title) ? 'movie' : 'series';

      return {
        id: title.id,
        mediaType,
        posterPath: getImageWithFallback(
          title.poster_path,
          `${mediaType}_poster`,
        ),
        blurhash: this.imagesService.generatePlaceholderBlurhash({
          id: title.id,
        }),
        preview: {
          title: isMovie(title) ? title.title : title.name,
          overview: title.overview || '',
          genres: GENRES.filter((genre) =>
            (title.genre_ids ?? []).includes(genre.id),
          ),
        },
      };
    });

    return {
      page: response.page,
      results,
      total_pages: response.total_pages,
      total_results: response.total_results,
    };
  }

  private filterLowQualityTitles(
    titles: (TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail)[],
  ) {
    const titlesWithPosters = this.filterTitlesWithPosters(titles);
    return this.filterTitlesWithNames(titlesWithPosters);
  }

  private filterTitlesWithPosters(
    titles: (TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail)[],
  ) {
    return titles.filter((title) => Boolean(title.poster_path));
  }

  private filterTitlesWithNames(
    titles: (TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail)[],
  ) {
    return titles.filter((title) => 'title' in title || 'name' in title);
  }
}
