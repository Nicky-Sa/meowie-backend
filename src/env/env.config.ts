import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' }); // the default env file

export const envConfig = z.object({
  TMDB_API_KEY: z.string().min(1, { message: 'TMDB_API_KEY is required' }),
  OMDB_API_KEY: z.string().min(1, { message: 'OMDB_API_KEY is required' }),
  PORT: z.coerce.number({ message: 'PORT is required' }),
  BUILD_ENV: z.enum(['development', 'preview', 'production'], {
    message: 'BUILD_ENV is required',
  }),
  DB_SSL_CA: z.string().min(1, { message: 'DB_SSL_CA is required' }),
  DB_ENDPOINT: z.string().min(1, { message: 'DB_ENDPOINT is required' }),
  DB_USER: z.string().min(1, { message: 'DB_USER is required' }),
  DB_PASSWORD: z.string().min(1, { message: 'DB_PASSWORD is required' }),
  DB_NAME: z.string().min(1, { message: 'DB_NAME is required' }),
  DB_PORT: z.coerce.number({ message: 'DB_PORT is required' }),
  DB_HOST: z.string().min(1, { message: 'DB_HOST is required' }),
  DB_MIGRATOR_USER: z
    .string()
    .min(1, { message: 'DB_MIGRATOR_USER is required' }),
  DB_MIGRATOR_PASSWORD: z.string().min(1, {
    message: 'DB_MIGRATOR_PASSWORD is required',
  }),
  REDIS_ENDPOINT: z.string().min(1, { message: 'REDIS_ENDPOINT is required' }),
  REDIS_PORT: z.coerce.number({ message: 'REDIS_PORT is required' }),
});

export type Env = z.infer<typeof envConfig>;

export function loadEnv(): Env {
  return envConfig.parse(process.env);
}
