FROM node:14-alpine as build

WORKDIR /app

COPY *.json /app/
COPY src /app/src
COPY scripts /app/scripts

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh
RUN git clone https://github.com/robballou/weeknotes.git
RUN npm install && \
    npm run build && \
    ./node_modules/.bin/ts-node scripts/generate.ts weeknotes

FROM node:14-alpine

EXPOSE 80

WORKDIR /app

COPY --from=build /app/html /app/html
COPY --from=build /app/dist /app
COPY *.json /app/
COPY src/*.ejs /app/src/
COPY src/*.css /app/src/

RUN npm ci

ENTRYPOINT [ "node", "src/index.js" ]
