import { Injectable } from '@nestjs/common';
import { PersonResDto } from './dto/person.dto';
import { getImage } from '../images/images.utils';
import { CacheService } from 'src/cache/cache.service';
import { Cacheable } from '../cache/cacheable.decorator';
import { TmdbService } from '../tmdb/tmdb.service';
import { ImagesService } from '../images/images.service';
import { PosterResDto } from '../common/dto/poster.dto';
import { Duration } from '../common/app.constants';
import { PosterInfo } from '../images/poster';
import { formatGenres, tmdbMediaTypeToAppMediaType } from '../utils/media';
import { GENRES } from '../constants/items/genres.constant';
import {
  TMDB_CombinedCreditsCast,
  TMDB_CombinedCreditsCrew,
} from '../tmdb/tmdb.type';

@Injectable()
export class PersonService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly cacheService: CacheService,
    private readonly imagesService: ImagesService,
  ) {}

  @Cacheable({
    key: (personId: number) => `person-info-${personId}`,
    ttl: Duration.ONE_WEEK,
  })
  async getPersonInfo(id: number) {
    try {
      const response = await this.tmdbService.getPerson(id);
      const data: PersonResDto = {
        id: response.id,
        name: response.name,
        profilePath: getImage(response.profile_path, 'person'),
        knownForDepartment: response.known_for_department.toLowerCase(),
      };
      return data;
    } catch (error) {
      throw new Error('Error fetching person info', { cause: error });
    }
  }

  @Cacheable({
    key: (personId: number) => `person-combined-posters-${personId}`,
    ttl: Duration.ONE_DAY,
  })
  async getCombinedPosters(personId: number): Promise<PosterResDto> {
    const combinedCredits = await this.tmdbService.getCombinedCredits(personId);
    const { cast, crew } = combinedCredits;

    const castResults: PosterInfo[] = cast.map((item) =>
      this.mapToPosterInfo(
        item,
        item.character ? `Performing as ${item.character}` : 'N/A',
      ),
    );

    const crewResults: PosterInfo[] = crew.map((item) =>
      this.mapToPosterInfo(item, item.job),
    );

    // aggregated based on id which is media's id
    const results = [...castResults, ...crewResults].reduce((acc, item) => {
      const existingItem = acc.find((i) => i.id === item.id);
      if (existingItem) {
        if (existingItem.role === 'N/A') {
          existingItem.role = item.role;
        } else {
          existingItem.role += `, and ${item.role}`;
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as PosterInfo[]);

    return { results, page: 1, total_pages: 1, total_results: results.length };
  }

  private mapToPosterInfo(
    item: TMDB_CombinedCreditsCast | TMDB_CombinedCreditsCrew,
    role: string,
  ): PosterInfo {
    const mediaType = tmdbMediaTypeToAppMediaType(item.media_type);
    const posterType =
      mediaType === 'series' ? 'series_poster' : 'movie_poster';

    const genreIds = item.genre_ids || [];
    const tmdbGenres = GENRES.filter((g) => genreIds.includes(g.id)).map(
      (g) => ({ id: g.id, name: g.name }),
    );
    const posterPath = getImage(item.poster_path, posterType);
    const blurhash = this.imagesService.generatePlaceholderBlurhash({
      id: item.id,
    });

    return {
      id: item.id,
      posterPath,
      blurhash,
      mediaType,
      role,
      preview: {
        title: item.title || item.name || '',
        genres: formatGenres(tmdbGenres),
        overview: item.overview || '',
      },
    };
  }
}
