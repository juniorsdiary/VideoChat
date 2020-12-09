FROM nginx:1.15-alpine

RUN rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY cert.crt /etc/ssl/certs/nginx-selfsigned.crt
COPY key.key /etc/ssl/private/nginx-selfsigned.key

EXPOSE 80
