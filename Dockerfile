FROM node:12

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get -yqq install   \
krb5-user krb5-config krb5-pkinit \
libkrb5-dev jq \
libpam-krb5 libpam-ccreds krb5-pkinit \
krb5-multidev libkrad-dev libkrb5-dev && \
apt-get -yqq clean && \
rm -rf /tmp/* /var/lib/apt/lists/* /var/tmp/* &&\
ln -s /usr/bin/awk /bin/awk 

COPY ./tmp/keytab /etc

COPY package*.json ./
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

WORKDIR /app/modules/kerberos
RUN npm install && npm run-script rebuild && npm prune --production


WORKDIR /app

EXPOSE 3000/tcp

CMD [ "npm", "start" ]