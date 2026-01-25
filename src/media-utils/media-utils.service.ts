import { Injectable, Logger } from '@nestjs/common';
import { RatingEntry } from '../models/ratings.model';
import axios from 'axios';
import {
  RATING_SOURCES,
  Whatson_MediaItem,
} from '../models/thirdparty/whatson';
import { PERSON_FALLBACK_URL, WHATSON_BASE_URL } from '../utils/constants';
import { Cacheable } from '../cache/cacheable.decorator';
import { getImage, PosterProps } from '../models/image.model';
import { Vibrant } from 'node-vibrant/node';
import sharp from 'sharp';
import { encode } from 'blurhash';
import {
  TMDB_Genre,
  TMDB_MovieInfo,
  TMDB_Videos,
} from '../models/thirdparty/tmdb';
import { getGenreEmoji } from '../models/genres.model';
import { CastInfo } from '../models/info.model';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class MediaUtilsService {
  private readonly logger = new Logger();

  constructor(private readonly cacheService: CacheService) {}

  public readonly emptyCast: CastInfo = {
    id: -1,
    name: 'N/A',
    character: '',
    creditId: '',
    profilePath: PERSON_FALLBACK_URL,
  };

  async getRatings(
    mediaType: 'movie' | 'tvshow',
    id: number,
    tmdbVoteAverage: number,
  ): Promise<RatingEntry[]> {
    let ratings: RatingEntry[] = [];

    try {
      const response = await axios.get<Whatson_MediaItem>(
        `${WHATSON_BASE_URL}/${mediaType}/${id}`,
      );
      const item = response.data;
      // 1. IMDb ⭐
      ratings.push({
        source: 'IMDb',
        value: item.imdb?.users_rating ? `${item.imdb.users_rating}` : 'N/A',
      });

      // 2. Rotten Tomatoes 🍅
      // Prioritizing Critics' Rating (Tomatometer)
      ratings.push({
        source: 'Rotten Tomatoes',
        value: this.cleanRating(item.rotten_tomatoes?.critics_rating, '%'),
      });

      // 3. Metacritic Ⓜ️
      // Prioritizing Critics Rating (Metascore)
      ratings.push({
        source: 'Metacritic',
        value: this.cleanRating(item.metacritic?.critics_rating),
      });

      // 4. TMDB 🎬
      ratings.push({
        source: 'TMDB',
        value: this.cleanRating(item.tmdb?.users_rating || tmdbVoteAverage),
      });
    } catch {
      ratings = RATING_SOURCES.map((source) => ({
        source,
        value: 'N/A',
      }));
      if (tmdbVoteAverage) {
        ratings.find((rating) => rating.source === 'TMDB')!.value =
          this.cleanRating(tmdbVoteAverage);
      }
    }
    return ratings;
  }

  cleanRating(rating: number | undefined, postfix: string = ''): string {
    if (typeof rating !== 'number') return 'N/A';
    return Math.floor(rating * 10) / 10 + postfix; // truncate to 1 decimal place
  }

  @Cacheable({
    key: (url: string) => `poster-props-${url}`,
    ttl: 3600 * 24 * 30,
  })
  async generatePosterProps(url: string): Promise<PosterProps> {
    let primaryColorHex = '#1F3854';
    let blurhash = 'U11o;?of00of00of00of00of00of00of00of';

    try {
      const response = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
      });
      const buffer = Buffer.from(response.data);

      const [hexResult, blurhashResult] = await Promise.allSettled([
        this.getPrimaryColorHex(buffer),
        this.getBlurhash(buffer),
      ]);

      if (hexResult.status === 'fulfilled' && hexResult.value) {
        primaryColorHex = hexResult.value;
      }

      if (blurhashResult.status === 'fulfilled' && blurhashResult.value) {
        blurhash = blurhashResult.value;
      }

      return { primaryColorHex, blurhash };
    } catch (error) {
      if (error instanceof AggregateError) {
        this.logger.error(
          `AggregateError generating poster props: ${error.message}\n`,
          `Errors: ${error.errors.join('\n ')}`,
        );
      }
      this.logger.error(`Error generating poster props: ${error}`);
    }
    return {
      primaryColorHex,
      blurhash,
    };
  }

  private async getPrimaryColorHex(
    buffer: Buffer,
  ): Promise<string | undefined> {
    const palette = await Vibrant.from(buffer).getPalette();
    return palette.LightVibrant?.hex;
  }

  private async getBlurhash(buffer: Buffer): Promise<string | undefined> {
    const { data, info } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true });

    return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
  }

  findTrailerKey(videoList: TMDB_Videos): string {
    const { results } = videoList;
    const youtubeVideos = results.filter((video) => video.site === 'YouTube');

    if (!youtubeVideos) {
      return '';
    }

    const trailers = youtubeVideos.filter((video) => video.type === 'Trailer');
    // 1. Look for a video that is both Trailer and Official
    const officialTrailer = trailers.find((video) => video.official)?.key;

    if (officialTrailer) {
      return officialTrailer;
    }

    // 2. Look for a video that is a Trailer (regardless of official status)
    const trailer = trailers[0]?.key;

    if (trailer) {
      return trailer;
    }

    // 3. Return the first video in the list (if any)
    return youtubeVideos[0]?.key ?? '';
  }

  formatDuration(minutes?: number) {
    if (typeof minutes !== 'number') return 'N/A';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  formatGenres(genreIds: TMDB_Genre[]) {
    return genreIds.map((genre) => ({
      ...genre,
      emoji: getGenreEmoji(genre.id),
    }));
  }

  formatCasts(tmdbCasts: TMDB_MovieInfo['credits']['cast']): CastInfo[] {
    // 1. Deduplicate first using a Map (Key = ID, Value = Object)
    const uniqueCastMap = new Map(tmdbCasts.map((cast) => [cast.id, cast]));
    // 2. Convert back to array and chain your logic
    return [...uniqueCastMap.values()]
      .filter((cast) => cast.known_for_department === 'Acting')
      .sort((a, b) => a.order - b.order)
      .slice(0, 5)
      .map((cast) => ({
        id: cast.id,
        name: cast.name,
        character: `${cast.known_for_department}: ${cast.character}`,
        creditId: cast.credit_id,
        profilePath: getImage(cast.profile_path, 'person'),
      }));
  }
}
