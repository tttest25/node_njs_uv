# Проект геоанализ Управляем вместе
проект для геоанализа управляем вместе

Запуск
------------
перед сборкой выполнить
1. при установки поменять пароль - по умолчанию `mysecretpassword`
2. поменять ./.env 
3. скопировать keytab в /etc/krb5.keytab
4. если разработка ведется не на хосте - исправить C:\Windows\System32\drivers\etc\hosts  - на что то `10.59.20.96 sm.gorodperm.ru`

## Logs
npm start | jq -crR 'fromjson? | select(type == "object")'

## Autocannon
./node_modules/.bin/autocannon -c 100 -d 5 -p 10 http://127.0.0.1:3000


## Prerequisites
 1. kerberos client install (see bellow krb5)
 2. custom module npm kerberos build, not native kerberos (not support node12)
 3. custom /etc/krb5.conf , /etc/krb5.keytab

## ChangeLog 
 *   20190801 - Init
 *   20190805 - Add SSO support kerberos module
 *   20190806 - Add  "ephemeral" docker and log with CLS (on each cls) + add docker run log rotate
 *   20190820 - Add auth / log / api db

------------
## Deploy
~~~Bash
git clone https://github.com/tttest25/node_njs_uv.git
cp .env_example .env
vim .env
docker build -t melnikov_ea/node_njs_uv .
# for initial install
docker run \
-p 3000:3000 \
-p 9229:9229 \
-v $(pwd):/app \
-m "300M" --memory-swap "1G" \
--log-driver json-file --log-opt max-size=2m \
--name "node_njs_uv" \
-it --entrypoint /bin/bash melnikov_ea/node_njs_uv

# run bash in container and run



#after install node_modules run
docker run \
-p 3000:3000 \
-p 9229:9229 \
-v $(pwd):/app \
-m "300M" --memory-swap "1G" \
--log-driver json-file --log-opt max-size=2m \
--name "node_njs_uv" \
-d melnikov_ea/node_njs_uv
 

--rm \
-w "/home/node/app" 
~~~





~~~
API:
http://127.0.0.1:3000/map
http://127.0.0.1:3000/api/get_topics
http://127.0.0.1:3000/api/get_claims_by_geo?topic=Ямы, выбоины на дороге, тротуаре
http://127.0.0.1:3000/api/get_claims_by_geo?lat=57.99330304745119&lng=56.19769414257814&topic=Ямы, выбоины на дороге, тротуаре
~~~



Logging
------------
https://habr.com/ru/post/442392/ - почитать про подход
https://github.com/keenondrums/cls-proxify - проект про прокси CLS
https://itnext.io/give-your-logs-more-context-7b43ea6b4ae6 - как нужно писать



Kerberos
------------
~~~BASH
#For install kerberos on OS:
apt search kerberos
apt install krb5-user krb5-config krb5-pkinit
apt install libkrb5-dev
apt install libpam-krb5 libpam-ccreds krb5-pkinit
apt install krb5-multidev libkrad-dev libkrb5-dev
apt install nodejs
# kerberos npm - clone branch with node 12 support
git clone -b NODE-1984/add-node-12-support https://github.com/mongodb-js/kerberos.git
git branch -a
 npm run-script 

~~~



~~~
C:\Users\melnikov-ea\Documents\NodeJS\njs_uv>C:\Users\melnikov-ea\AppData\Roaming\npm\express.cmd

  warning: the default view engine will not be jade in future releases
  warning: use `--view=jade' or `--help' for additional options


   create : public\
   create : public\javascripts\
   create : public\images\
   create : public\stylesheets\
   create : public\stylesheets\style.css
   create : routes\
   create : routes\index.js
   create : routes\users.js
   create : views\
   create : views\error.jade
   create : views\index.jade
   create : views\layout.jade
   create : app.js
   create : package.json
   create : bin\
   create : bin\www

   install dependencies:
     > npm install

   run the app:
     > SET DEBUG=njs-uv:* & npm start
~~~

Помощь по коду
------------
~~~
handle failed async request - https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
Async Await - https://medium.com/@stasonmars/%D0%B2%D1%81%D0%B5%CC%88-%D1%87%D1%82%D0%BE-%D0%BD%D1%83%D0%B6%D0%BD%D0%BE-%D0%B7%D0%BD%D0%B0%D1%82%D1%8C-%D0%BE%D0%B1-async-await-%D1%86%D0%B8%D0%BA%D0%BB%D1%8B-%D0%BA%D0%BE%D0%BD%D1%82%D1%80%D0%BE%D0%BB%D1%8C-%D0%BF%D0%BE%D1%82%D0%BE%D0%BA%D0%BE%D0%B2-%D0%BE%D0%B3%D1%80%D0%B0%D0%BD%D0%B8%D1%87%D0%B5%D0%BD%D0%B8%D1%8F-76dde2cb6949
Fetch:Common mistake fetch  - https://medium.com/cameron-nokes/4-common-mistakes-front-end-developers-make-when-using-fetch-1f974f9d1aa1

Пример Fetch:
function addUser(details) {
  return fetch('https://api.example.com/user', {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(details),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-XSRF-TOKEN': getCookieValue('XSRF-TOKEN')
    }
  }).then(response => {
    return response.json().then(data => {
      if (response.ok) {
        return data;
      } else {
        return Promise.reject({status: response.status, data});
      }
    });
  });
}

function makeRequest(url) {
  fetch(url).then(function(response) {
    // Shorthand to check for an HTTP 2xx response status.
    // See https://fetch.spec.whatwg.org/#dom-response-ok
    if (response.ok) {
      return response;
    }
    // Raise an exception to reject the promise and trigger the outer .catch() handler.
    // By default, an error response status (4xx, 5xx) does NOT cause the promise to reject!
    throw Error(response.statusText);
  }).then(function(response) {
    return response.json();
  }).then(function(json) {
    ChromeSamples.log('Request succeeded with JSON response:', json);
  }).catch(function(error) {
    ChromeSamples.log('Request failed:', error.message);
  });
}

makeRequest('notfound.json');
makeRequest('users.json');
~~~