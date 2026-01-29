FROM node:18-alpine AS build

WORKDIR /app

# Accept build arguments
ARG API_URL=/API_URL
ARG PUBLIC_PATH=/

COPY package*.json ./
RUN npm ci

COPY . .

# Create .env file with build arguments
RUN echo "API_URL=${API_URL}" > .env && \
    echo "PUBLIC_PATH=${PUBLIC_PATH}" >> .env

RUN npm run build

FROM nginx:1.25-alpine

COPY e4l.frontend.docker/web/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/e4l.frontend.docker/web/dist/ /usr/share/nginx/html/

# Copy static assets (images, files, language, profile)
COPY --from=build /app/src/public/ /usr/share/nginx/html/public/

EXPOSE 80

