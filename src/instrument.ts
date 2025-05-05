import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: 'https://2b8af543cb4cf16e722afb265c4bebc2@o4509265002037248.ingest.de.sentry.io/4509272962039888',
  environment: process.env.BUILD_ENV,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
