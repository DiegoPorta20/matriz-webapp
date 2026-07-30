# Angular 20 soporta Node 20.19+, 22.12+ y 24. Se fija 22 LTS: la maquina de
# desarrollo puede tener Node 26, pero la build reproducible es esta.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

# nginx-unprivileged corre como uid 101 de principio a fin. La imagen nginx
# normal arranca su proceso maestro como root aunque los workers no lo sean.
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 8080
