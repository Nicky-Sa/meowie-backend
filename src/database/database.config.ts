import { DataSourceOptions } from 'typeorm';
import * as fs from 'node:fs';
import { loadEnv } from '../env/env.config';

export type DbConnectionRole = 'app' | 'migrator';

const env = loadEnv();

export const getDataSourceOptions = (
  role: DbConnectionRole = 'app',
): DataSourceOptions => {
  const username = role === 'migrator' ? env.DB_MIGRATOR_USER : env.DB_APP_USER;
  const password =
    role === 'migrator' ? env.DB_MIGRATOR_PASSWORD : env.DB_APP_PASSWORD;

  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    schema: 'meowie',

    username,
    password,

    // Migration related info
    ...(role === 'migrator'
      ? {
          migrationsTableName: 'meowie_migrations',
          entities: ['src/**/*.entity.ts'],
          migrations: ['migrations/*.ts'],
        }
      : {}),

    invalidWhereValuesBehavior: {
      null: 'throw',
      undefined: 'throw',
    },
    extra: {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(env.DB_SSL_CA, 'utf8'),
        servername: env.DB_HOST,
      },
    },
  };
};
