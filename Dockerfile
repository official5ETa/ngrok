FROM node:18.7-slim

WORKDIR /home/node

COPY app/package*.json ./
RUN npm ci --no-update-notifier

ENV INTERVAL=60000

COPY app/ ./

CMD ["index.js"]