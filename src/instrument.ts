import * as Sentry from '@sentry/nestjs';
import { loadEnv } from './env/env.config';

const env = loadEnv();

Sentry.init({
  dsn: 'https://2b8af543cb4cf16e722afb265c4bebc2@o4509265002037248.ingest.de.sentry.io/4509272962039888',
  environment: env.BUILD_ENV,
  release: env.SENTRY_RELEASE,
  // We explicitly disable PII data tracking to avoid IP and username collection
  sendDefaultPii: false,
});
