import { DataSource } from 'typeorm';
import * as fs from 'node:fs';
import { loadEnv } from './env/env.config';

const env = loadEnv();

export default new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_MIGRATOR_USER,
  password: env.DB_MIGRATOR_PASSWORD,
  schema: 'meowie',
  migrationsTableName: 'meowie_migrations',
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  extra: {
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(env.DB_SSL_CA, 'utf8'),
      servername: env.DB_ENDPOINT,
    },
  },
});
