FROM node:22-alpine

WORKDIR /app
COPY . .

ARG BUILD_ENV
RUN cp .env.$BUILD_ENV .env.local

RUN npm ci
RUN npm run build

CMD ["npm", "start"]
