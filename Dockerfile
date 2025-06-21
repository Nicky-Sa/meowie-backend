FROM node:22-alpine

WORKDIR /app
COPY . .

ARG BUILD_ENV
RUN cp .env.$BUILD_ENV .env.local

RUN npm ci

RUN --mount=type=secret,id=sentry_token \
    export SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry_token) && \
    npm run build

CMD ["npm", "start"]
