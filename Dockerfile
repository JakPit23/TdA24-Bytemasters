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

# Enables to run `npm run serve`
RUN npm i -g nodemon
RUN npx tailwindcss -i /app/public/css/src.css -o /app/public/css/app.css

EXPOSE 3000/tcp

WORKDIR /app
CMD ["node", "app.js"]