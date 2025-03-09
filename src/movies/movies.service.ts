import axios from 'axios';
import { EnvService } from 'src/env/env.service';
import { Injectable } from '@nestjs/common';
import { MoviesList } from 'src/movies/models/moviesList';

@Injectable()
export class MoviesService {
  private readonly TMDB_API_KEY: string;
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org';

  constructor(private readonly envService: EnvService) {
    this.TMDB_API_KEY = this.envService.get('TMDB_API_KEY');
  }

  async getMovieIds(page: number): Promise<MoviesList> {
    const url = `${this.TMDB_BASE_URL}/3/discover/movie?include_adult=true&language=en-US&sort_by=popularity.desc&api_key=${this.TMDB_API_KEY}&page=${page}`;

    try {
      const response = await axios.get<MoviesList>(url);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching movies ids: ${error}`);
    }
  }
}
