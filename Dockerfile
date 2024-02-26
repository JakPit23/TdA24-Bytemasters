FROM node:20.9.0 AS builder

WORKDIR /app

COPY ./src /app
RUN npm ci --omit=dev

# Copy build result to a new image (saves a lot of disk space)
FROM node:20.9.0
COPY --from=builder /app /app

# Move node_modules one directory up, so during development
# we don't have to mount it in a volume.
# This results in much faster reloading!
RUN mv /app/node_modules /node_modules

WORKDIR /app
RUN npx tailwindcss -c /app/tailwind.config.js -i /app/public/css/src.css -o /app/public/css/app.css

ENV NODE_ENV=production
ENV LOG_LEVEL=debug
ENV SECRET_KEY=8b1748ee-595a-4d96-b381-36f95f70ecee

VOLUME /app/data
EXPOSE 3000/tcp

CMD ["node", "app.js"]