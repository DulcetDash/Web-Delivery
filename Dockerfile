FROM mhart/alpine-node:14

ADD . /app/

WORKDIR /app/

RUN rm .env
#Production
RUN mv .env_live .env
#Development
# RUN mv .env_dev .env

RUN npm install yarn -g --force
RUN yarn global add pm2
RUN yarn global add pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 50Mb
RUN yarn install

EXPOSE 9999


CMD [ "pm2-runtime", "ecosystem.config.js" ]