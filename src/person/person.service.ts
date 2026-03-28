import { Injectable } from '@nestjs/common';
import { PersonResDto } from './dto/person.dto';
import { getImage } from '../images/images.utils';
import { CacheService } from 'src/cache/cache.service';
import { Cacheable } from '../cache/cacheable.decorator';
import { TmdbService } from '../tmdb/tmdb.service';
import { PosterResDto } from '../common/dto/poster.dto';
import { DEFAULT_BLURHASH } from '../common/app.constants';
import { PosterInfo } from '../images/poster';
import { TmdbMediaTypeToAppMediaType } from '../utils/media';

@Injectable()
export class PersonService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly cacheService: CacheService,
  ) {}

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
    ttl: 3600 * 24,
  })
  async getCombinedPosters(personId: number): Promise<PosterResDto> {
    const combinedCredits = await this.tmdbService.getCombinedCredits(personId);
    const { cast, crew } = combinedCredits;
    const castResults: PosterInfo[] = cast.map((item) => {
      const mediaType = TmdbMediaTypeToAppMediaType(item.media_type);
      return {
        id: item.id,
        blurhash: DEFAULT_BLURHASH,
        posterPath: getImage(item.poster_path, `${mediaType}_poster`),
        mediaType,
        role: item.character ? `Performing as ${item.character}` : 'N/A',
      };
    });
    const crewResults: PosterInfo[] = crew.map((item) => {
      const mediaType = TmdbMediaTypeToAppMediaType(item.media_type);
      return {
        id: item.id,
        blurhash: DEFAULT_BLURHASH,
        posterPath: getImage(item.poster_path, `${mediaType}_poster`),
        mediaType: mediaType,
        role: item.job,
      };
    });

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
}
