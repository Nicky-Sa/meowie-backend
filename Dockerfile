FROM node:24-alpine

WORKDIR /app

# 1. Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# 2. Copy the pre-compiled dist folder from the GitHub runner
COPY dist ./dist

CMD ["npm", "run","start:deployed"]
