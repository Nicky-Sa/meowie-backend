import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TMDB_MovieCredits, TMDB_Person } from '../models/thirdparty/tmdb';
import { EnvService } from '../env/env.service';
import { TMDB_BASE_URL } from '../utils/constants';
import { PersonResDto } from './dto/person.dto';
import { getImage } from '../movies/models/image.model';

@Injectable()
export class PersonService {
  private readonly TMDB_API_KEY: string;

  constructor(private readonly env: EnvService) {
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

  async getRoleInMovie(personId: number, movieId: number) {
    try {
      const response = await axios.get<TMDB_MovieCredits>(
        `${TMDB_BASE_URL}/3/movie/${movieId}/credits`,
        {
          params: {
            api_key: this.TMDB_API_KEY,
          },
        },
      );
      const credits = response.data;
      const cast = credits.cast.find((cast) => cast.id === personId);
      if (cast) {
        return { role: `Performing as ${cast.character}` };
      }
      const crewJobs = credits.crew.filter((crew) => crew.id === personId);
      if (crewJobs.length > 0) {
        const knownForDepartment = crewJobs[0].known_for_department;
        // first, try to find the role which matches what they are known for
        const primaryRole = crewJobs.find(
          (crew) => crew.department === knownForDepartment,
        );
        if (primaryRole) {
          return { role: primaryRole.job };
        }
        // if we can't find a role that matches what they are known for, return the first role
        return { role: crewJobs[0].job };
      }
      return { role: 'N/A' };
    } catch {
      return { role: 'N/A' };
    }
  }
}
