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
  DB_NAME: z.string().min(1, { message: 'DB_NAME is required' }),
  DB_PORT: z.coerce.number({ message: 'DB_PORT is required' }),
  DB_APP_USER: z.string().min(1, { message: 'DB_APP_USER is required' }),
  DB_APP_PASSWORD: z
    .string()
    .min(1, { message: 'DB_APP_PASSWORD is required' }),
  DB_HOST_POOLING: z.string().min(1, {
    message: 'DB_HOST_POOLING for high performance app connections is required',
  }),
  DB_MIGRATOR_USER: z
    .string()
    .min(1, { message: 'DB_MIGRATOR_USER is required' }),
  DB_MIGRATOR_PASSWORD: z.string().min(1, {
    message: 'DB_MIGRATOR_PASSWORD is required',
  }),
  DB_HOST_MIGRATOR: z.string().min(1, {
    message: 'DB_HOST_MIGRATOR with no pooling for migrations is required',
  }),
  VALKEY_HOST: z.string().min(1, { message: 'VALKEY_HOST is required' }),
  VALKEY_ENDPOINT: z
    .string()
    .min(1, { message: 'VALKEY_ENDPOINT is required' }),
  VALKEY_PORT: z.coerce.number({ message: 'VALKEY_PORT is required' }),
  AWS_ACCESS_KEY_ID: z
    .string()
    .min(1, { message: 'AWS_ACCESS_KEY_ID is required' }),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, {
    message: 'AWS_SECRET_ACCESS_KEY is required',
  }),
  AWS_REGION: z.string().min(1, { message: 'AWS_REGION is required' }),
  SENDER_EMAIL: z.email().min(1, { message: 'SENDER_EMAIL is required' }),
  JWT_SECRET: z.string().min(100, {
    message: 'JWT_SECRET is required and must be at least 100 characters long',
  }),
  JWT_REFRESH_SECRET: z.string().min(100, {
    message:
      'JWT_REFRESH_SECRET is required and must be at least 100 characters long',
  }),
});

export type Env = z.infer<typeof envConfig>;

export function loadEnv(): Env {
  return envConfig.parse(process.env);
}
