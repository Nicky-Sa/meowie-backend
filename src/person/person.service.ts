import { Injectable } from '@nestjs/common';
import { TMDB_MovieCredits } from '../tmdb/tmdb.type';
import { PersonResDto, RoleInMovieResDto } from './dto/person.dto';
import { getImage } from '../images/images.utils';
import { CacheService } from 'src/cache/cache.service';
import { Cacheable } from '../cache/cacheable.decorator';
import { TmdbService } from '../tmdb/tmdb.service';

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
      throw new Error(`Error fetching person info: ${error}`);
    }
  }

  @Cacheable({
    key: (personId: number, movieId: number) =>
      `person-role-in-movie-${personId}-${movieId}`,
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

  private findRoleInCredits(
    credits: TMDB_MovieCredits,
    personId: number,
  ): string {
    const cast = credits.cast.find((cast) => cast.id === personId);
    console.log({ cast });
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
