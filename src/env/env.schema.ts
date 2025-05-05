import { z } from 'zod';

export const envSchema = z.object({
  TMDB_API_KEY: z.string().min(1, { message: 'TMDB_API_KEY is required' }),
  OMDB_API_KEY: z.string().min(1, { message: 'OMDB_API_KEY is required' }),
  PORT: z.coerce.number({ message: 'PORT is required' }),
  BUILD_ENV: z.enum(['local', 'development', 'preview', 'production'], {
    message: 'BUILD_ENV is required',
  }),
});

export type Env = z.infer<typeof envSchema>;
