FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --production

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY src ./src
EXPOSE 3012
CMD ["node", "src/index.js"]
