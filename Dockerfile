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

# Se repite el ARG: cada etapa tiene los suyos.
ARG API_BASE_URL=http://localhost:8080/api/v1

# root solo para escribir la configuracion; el proceso vuelve a uid 101 al final.
USER root

COPY nginx.conf /etc/nginx/conf.d/default.conf

# La CSP tiene que permitir el origen de la API.
#
# Con rutas relativas, `connect-src 'self'` bastaba. Con una URL absoluta el
# navegador BLOQUEA la llamada antes de enviarla, asi que la aplicacion no
# funciona aunque CORS este perfectamente configurado en go-api. Es un fallo que
# no se ve con curl, porque curl no aplica CSP.
#
# El origen se deriva de API_BASE_URL para que haya una sola fuente de verdad.
RUN set -eu; \
    case "$API_BASE_URL" in \
      http://*|https://*) \
        origin=$(printf '%s' "$API_BASE_URL" | cut -d/ -f1-3); \
        sed -i "s|connect-src 'self'|connect-src 'self' $origin|" \
          /etc/nginx/conf.d/default.conf; \
        echo "CSP: connect-src ampliado con $origin" ;; \
      *) \
        echo "CSP: API_BASE_URL es relativa, connect-src 'self' es suficiente" ;; \
    esac

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

USER 101

EXPOSE 8080
