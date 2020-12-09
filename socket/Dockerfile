FROM node:14.15.0

WORKDIR /usr/src/app/socket

COPY . ./

RUN npm ci

CMD ["npm", "run", "dev"]

EXPOSE 8001
