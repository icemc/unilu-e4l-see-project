FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.25-alpine

COPY e4l.frontend.docker/web/nginx.conf /etc/nginx/conf.d/default.conf

# ✅ copyamo točan build output (dist) koji webpack generira
COPY --from=build /app/e4l.frontend.docker/web/dist/ /usr/share/nginx/html/

COPY e4l.frontend.docker/web/command.sh /command.sh
RUN chmod +x /command.sh

EXPOSE 80

CMD ["/command.sh"]

