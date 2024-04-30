FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

# Set the command to run the app when the container starts
CMD [ "node", "main.js" ]