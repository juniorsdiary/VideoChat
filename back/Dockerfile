FROM node:14.15.0

WORKDIR /usr/src/app/backend

COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run build

CMD ["npm", "run", "start:dev"]

EXPOSE 8000
