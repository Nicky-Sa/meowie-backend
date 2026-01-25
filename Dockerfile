FROM node:24-alpine

WORKDIR /app
COPY . .

RUN npm ci

RUN npm run build

# This binary listens to Lambda events and forwards them to your app on HTTP
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.0 /lambda-adapter /opt/extensions/lambda-adapter

CMD ["npm", "run","start:lambda"]
