FROM node:20.16.0-alpine3.20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY server.js ./

EXPOSE 8080

CMD [ "node", "server.js" ]
