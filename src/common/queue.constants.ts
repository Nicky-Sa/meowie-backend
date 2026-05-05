export const EMAIL_QUEUE = {
  name: 'email',
  jobs: {
    sendEmail: 'send-email',
  },
} as const;

export const IMAGE_QUEUE = {
  name: 'image',
  jobs: {
    extractBlurhash: 'extract-blurhash',
  },
} as const;
