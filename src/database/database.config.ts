import { DataSourceOptions } from 'typeorm';
import { loadEnv, loadDbMigratorEnv } from '@/env/env.config';
import * as fs from 'fs';
import * as path from 'path';

export type DbConnectionRole = 'app' | 'migrator';

export const getDataSourceOptions = (
  role: DbConnectionRole = 'app',
): DataSourceOptions => {
  if (role === 'migrator') {
    const env = loadDbMigratorEnv();
    return {
      type: 'postgres',
      host: env.DB_HOST_MIGRATOR,
      port: env.DB_PORT,
      database: env.DB_NAME,
      schema: 'meowie',
      username: env.DB_MIGRATOR_USER,
      password: env.DB_MIGRATOR_PASSWORD,
      migrationsTableName: 'meowie_migrations',
      entities: ['src/**/*.entity.ts'],
      migrations: ['migrations/*.ts'],
      invalidWhereValuesBehavior: { null: 'throw', undefined: 'throw' },
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: true,
          ca: fs
            .readFileSync(path.join(__dirname, 'supabase-prod-ca-2021.crt'))
            .toString(),
        },
        max: 2,
        connectionTimeoutMillis: 2000,
      },
    };
  }

  const env = loadEnv();
  return {
    type: 'postgres',
    host: env.DB_HOST_POOLING,
    port: env.DB_PORT,
    database: env.DB_NAME,
    schema: 'meowie',
    username: env.DB_APP_USER,
    password: env.DB_APP_PASSWORD,
    invalidWhereValuesBehavior: { null: 'throw', undefined: 'throw' },
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: true,
        ca: fs
          .readFileSync(path.join(__dirname, 'supabase-prod-ca-2021.crt'))
          .toString(),
      },
      max: 10,
      connectionTimeoutMillis: 5000,
    },
  };
};
