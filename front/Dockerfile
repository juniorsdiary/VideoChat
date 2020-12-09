FROM node:14.15.0-alpine

WORKDIR /usr/src/app/front

COPY package*.json ./

RUN npm ci

COPY . ./

CMD ["npm", "run", "dev"]

EXPOSE 3000

