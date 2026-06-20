export const EMAIL_QUEUE = {
  name: 'email',
  jobs: {
    sendEmail: 'send-email',
  },
} as const;

export const COLLECTIONS_SYNC_QUEUE = {
  name: 'collections-sync',
  jobs: {
    syncAll: 'sync-all',
  },
} as const;

export const DEFAULT_WORKER_OPTIONS = {
  // Drastically reduce Redis command usage by increasing the block timeout
  // and stalled check intervals. This is especially useful for serverless Redis.
  drainDelay: 300, // 5 minutes (default is 5s)
  stalledInterval: 300000, // 5 minutes (default is 30s)
};
