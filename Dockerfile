FROM node:24.13.0

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "./"]

COPY . .

RUN npm install --location=global npm@8.15.0  && \
    npm install

RUN npm install 

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
