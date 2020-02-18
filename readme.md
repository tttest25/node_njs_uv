# Проект открытого конструктора БП.
Проект Rapid app delelopment для автоматизации бизнесс процессов,
в состав входит:
 * PG/NODE.JS
 * конструктор интерфесов и API + заготовка под централизованное логирование
 * администрирование, логирование
 * проект для геоанализа "управляем вместе"


## TODO
+ 0. add ip to session db in meta
+ 1. role models (auth roles)
+ 2. logging in db sus_log
+ 3. move api-> dict like template
  4. interface for api/templ dict + role model
+ 5. interface log
  6. typycal app - like skeletons
  7. webapp - split to 2 steps -> get data  and link to template + cache of templates on times
  8. add API auth on token without kerberos
  9. add APP index
 10. APP: add APP news + admin
 11. APP node js: перевод app -> var.locals
 12. APP: создать app c типовым CRUD
 13. APP: добавить APP для Index 
 14. APP: переделать механизм генерации html на <code>{tdata"...":  , tcache:...}, ссылку на template и не выгпужать template
 15. APP: создать mixin menu
 !16. Отправка почты
 +17. авторизация с переходом по ссылке
 

## Запуск
------------
перед сборкой выполнить
1. при установки поменять пароль - по умолчанию `mysecretpassword`
2. поменять ./.env 
3. скопировать keytab в /etc/krb5.keytab
4. если разработка ведется не на хосте - исправить C:\Windows\System32\drivers\etc\hosts  - на что то `10.59.20.96 sm.gorodperm.ru`

## Logs
npm start | jq -crR 'fromjson? | select(type == "object")'
## Send to Logstash
npm start | node ./node_modules/.bin/pino-socket -a 10.59.0.69 -p 3515 -m tcp -r | pino-pretty -c -t -i req


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
 *   20190826 - Move to postgre API and json params
 *   20190828 - Fix login + logging 
 *   20190920 - Add limit 50 mb (0.1.5)
              - Webapisql -> webapi
              - Add PG template 
              - Add working mode with pg_template PUG
 *   20190920 - Add Auth to DB WEB_API WEB_API_WEB (0.1.6 dev-webMode)
 *   20190928 - Add debug mode to PUG_editor (0.1.6 dev-webMode)
              - Created DOC /dec from markdown
              - Add /app mode and fix logging
 *   20191030 - Add js_text to info from issue
 *   20191111 - Add /update to auto update git resources 
 *   20191115 - Move interface to Bootstrap 4
                move API key GOOGLE to ENV 
 *   20191121 - Add logic to backup postgresql  /backup 
 *   20191124 - Fix kerberos auto login error - infinit loop 
 *   20191127 - 0.2.2 -> move /api to universal engine
 *   20191129 - 0.2.3 -> move /api,/app  to universal engine, add logs to DB, modified errors in db -> db return json in anyway 
 *   20191210 - 0.2.4 -> fix bootstrap select and add admin
 *   20200217 - 0.2.5 ->  add auth redirect to target page
 *   20200218 - 0.2.6 ->   ??? mailer 




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

PUG Express server side generated
------------
server side generated
https://gist.github.com/joepie91/c0069ab0e0da40cc7b54b8c2203befe1



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
-- SQL injection , как фильтровать строки если нет выбора
1. filter es6 example
console.log([...`Robert'); DROP TABLE Students;--`].filter( e => (   (e.toUpperCase() != e.toLowerCase() || isFinite(e) || '_='.includes(e))) && e!=' ').join(''));  
2. regexp
`Robert'); DROP TABLE Students;--`.replace(/[^\d\w.]+/gm,'')



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