import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TMDB_MovieCredits, TMDB_Person } from '../models/thirdparty/tmdb';
import { EnvService } from '../env/env.service';
import { TMDB_BASE_URL } from '../utils/constants';
import { PersonResDto, RoleInMovieResDto } from './dto/person.dto';
import { getImage } from '../movies/models/image.model';
import { CacheService } from 'src/cache/cache.service';
import { Cacheable } from '../cache/cacheable.decorator';

@Injectable()
export class PersonService {
  private readonly TMDB_API_KEY: string;

  constructor(
    private readonly env: EnvService,
    private readonly cacheService: CacheService,
  ) {
    this.TMDB_API_KEY = this.env.get('TMDB_API_KEY');
  }

  async getPersonInfo(id: number) {
    try {
      const response = await axios.get<TMDB_Person>(
        `${TMDB_BASE_URL}/3/person/${id}`,
        {
          params: {
            api_key: this.TMDB_API_KEY,
          },
        },
      );
      const data: PersonResDto = {
        id: response.data.id,
        name: response.data.name,
        profilePath: getImage(response.data.profile_path, 'person'),
        knownForDepartment: response.data.known_for_department.toLowerCase(),
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
      const response = await axios.get<TMDB_MovieCredits>(
        `${TMDB_BASE_URL}/3/movie/${movieId}/credits`,
        {
          params: {
            api_key: this.TMDB_API_KEY,
          },
        },
      );
      const role = this.findRoleInCredits(response.data, personId);
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
