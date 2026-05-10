FROM node:24-alpine

WORKDIR /app

# 1. Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# 2. Copy the pre-compiled dist folder from the GitHub runner
COPY dist ./dist

# 3. Healthcheck using port from env variables
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/health || exit 1

CMD ["npm", "run","start:deployed"]
