FROM node:alpine
WORKDIR /usr/app

COPY package.json ./
RUN npm install && npm cache clean --force

COPY tsconfig.json ./

COPY . .
COPY .env ./

EXPOSE ${PORT}

RUN npm run build
CMD ["npm", "run", "dev"]
