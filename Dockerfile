FROM node:18-alpine as base

WORKDIR /app
COPY ./src /app
RUN npm ci

ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "run", "start"]