import { DataSourceOptions } from 'typeorm';
import { loadEnv } from '../env/env.config';

export type DbConnectionRole = 'app' | 'migrator';

const env = loadEnv();

export const getDataSourceOptions = (
  role: DbConnectionRole = 'app',
): DataSourceOptions => {
  const username = role === 'migrator' ? env.DB_MIGRATOR_USER : env.DB_APP_USER;
  const password =
    role === 'migrator' ? env.DB_MIGRATOR_PASSWORD : env.DB_APP_PASSWORD;
  const host = role === 'migrator' ? env.DB_HOST_MIGRATOR : env.DB_HOST_POOLING;

  return {
    type: 'postgres',
    host,
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
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: true,
      },
      max: 2,
      connectionTimeoutMillis: 2000,
    },
  };
};
