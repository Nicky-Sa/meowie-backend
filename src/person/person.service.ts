import { Injectable } from '@nestjs/common';
import { TMDB_Credits } from '../tmdb/tmdb.type';
import { PersonResDto, RoleInMovieResDto } from './dto/person.dto';
import { getImage } from '../images/images.utils';
import { CacheService } from 'src/cache/cache.service';
import { Cacheable } from '../cache/cacheable.decorator';
import { TmdbService } from '../tmdb/tmdb.service';
import { PosterResDto } from '../common/dto/poster.dto';
import { MediaType } from '../types/media-type';
import { DEFAULT_BLURHASH } from '../common/app.constants';

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
    key: (personId: number) => `person-combined-credits-${personId}`,
    ttl: 3600 * 24,
  })
  async getCombinedCredits(personId: number) {
    return this.tmdbService.getCombinedCredits(personId);
  }

  @Cacheable({
    key: (personId: number, mediaId: number) =>
      `${personId}-role-in-${mediaId}`,
    ttl: 3600 * 24,
  })
  async getRoleInMovie(
    personId: number,
    movieId: number,
  ): Promise<RoleInMovieResDto> {
    try {
      const response = await this.tmdbService.getMovieCredits(movieId);
      const role = this.findRoleInCredits(response, personId);
      return { role };
    } catch {
      return { role: 'N/A' };
    }
  }

  async getCombinedPosters(personId: number): Promise<PosterResDto> {
    const combinedCredits = await this.getCombinedCredits(personId);
    const { cast, crew } = combinedCredits;
    const results = [...cast, ...crew].map((item) => ({
      id: item.id,
      blurhash: DEFAULT_BLURHASH,
      posterPath: getImage(item.poster_path, 'poster'),
      mediaType: item.media_type as MediaType,
    }));
    return { results, page: 1, total_pages: 1, total_results: results.length };
  }

  private findRoleInCredits(credits: TMDB_Credits, personId: number): string {
    const cast = credits.cast.find((cast) => cast.id === personId);
    if (cast && cast.character) {
      return `Performing as ${cast.character}`;
    }
    const crewJobs = credits.crew.filter((crew) => crew.id === personId);
    if (crewJobs.length > 0) {
      const knownForDepartment = crewJobs[0].known_for_department;
      // first, try to find the role which matches what they are known for
      const primaryRole = crewJobs.find(
        (crew) => crew.department === knownForDepartment,
      );
      if (primaryRole) {
        return primaryRole.job;
      }
      // if we can't find a role that matches what they are known for, return the first role
      return crewJobs[0].job;
    }
    return 'N/A';
  }
}
