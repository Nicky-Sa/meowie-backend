import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TMDB_Person } from '../models/thirdparty/tmdb';
import { EnvService } from '../env/env.service';
import { TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../utils/constants';
import { PersonResDto } from './dto/person.dto';

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
        profilePath: `${TMDB_IMAGE_BASE_URL}${response.data.profile_path}`,
        knownForDepartment: response.data.known_for_department,
      };
      return data;
    } catch (error) {
      throw new Error(`Error fetching person info: ${error}`);
    }
  }
}
