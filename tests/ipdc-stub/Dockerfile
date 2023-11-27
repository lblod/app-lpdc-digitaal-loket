FROM node:18-alpine

WORKDIR /usr/src/app
COPY . .
RUN npm ci

EXPOSE 80

CMD [ "npm", "run", "start" ]