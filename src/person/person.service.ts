import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TMDB_Person } from '../models/thirdparty/tmdb';
import { EnvService } from '../env/env.service';
import { TMDB_BASE_URL } from '../utils/constants';
import { PersonResDto } from './dto/person.dto';
import { getImage } from '../movies/models/image';

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
}
