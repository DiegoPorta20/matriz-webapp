# Angular 20 soporta Node 20.19+, 22.12+ y 24. Se fija 22 LTS: la maquina de
# desarrollo puede tener Node 26, pero la build reproducible es esta.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

# La URL de la API se resuelve al compilar, porque una SPA no tiene entorno de
# ejecucion en el servidor. Por eso es un ARG y no una variable del contenedor:
# ponerla en `docker run` no tendria ningun efecto.
#
# El valor por defecto apunta a localhost y no a go-api:8080, y no es un
# descuido: quien hace la peticion es el navegador del usuario, que corre en el
# host y no dentro de la red de Docker. Ahi `go-api` no resuelve.
ARG API_BASE_URL=http://localhost:8080/api/v1
ENV API_BASE_URL=${API_BASE_URL}

RUN npm run build

# nginx-unprivileged corre como uid 101 de principio a fin. La imagen nginx
# normal arranca su proceso maestro como root aunque los workers no lo sean.
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 8080
