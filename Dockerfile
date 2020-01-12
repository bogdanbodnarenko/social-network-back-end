FROM node:11.2-slim

WORKDIR /app

EXPOSE 4000

COPY .env.prod .env
COPY package.json package.json
RUN npm install typescript -g
RUN npm install

COPY . .
RUN npm run build

CMD ["node", "dist/"]

USER node