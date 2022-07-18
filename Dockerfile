FROM node:14.16.0-stretch-slim-oracle19_1
LABEL MAINTAINER beken <beken@example.kg>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY /data /usr/src/app

# Install app dependencies
RUN npm install --verboose

#TimeZone
ENV TZ=Asia/Bishkek
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 3000

CMD [ "npm", "start" ]