FROM node:18.7-slim

WORKDIR /home/node

ENV INTERVAL=60000

COPY app/ ./

RUN npm i

CMD ["index.js"]