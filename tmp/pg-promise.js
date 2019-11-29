'use strict';

const express = require('express');
const cuid = require('cuid');
const cLogger = require('../log');
var pgp = require("pg-promise")(/*options*/);

var db = pgp("test");



const pino = require('pino')
cLogger.logger
.child({a: 'property'})
.child({a: 'prop'})
.info('howdy')
var a="oxF04DkwW1s-ramgNvZxNqcKHKHlOWew'; SELECT 'zopa";
db.any(`SELECT sid FROM webapi.web_sessions where sid=$1`, ["oxF04DkwW1s-ramgNvZxNqcKHKHlOWew'; SELECT 'zopa"])
    .then(data => {
        cLogger.logger.info({data}, 'DATA:'); // print data;
    })
    .catch(error => {
        cLogger.logger.info({error},'ERROR:', ); // print the error;
    })
    .finally(db.$pool.end); // For immediate app exit, shutting down the connection pool
// For details see: https://github.com/vitaly-t/pg-promise#library-de-initialization

const PORT = Number(process.env.PORT) || 3000;

function clsRequestId(namespace, generateId) {
    return (req, res, next) => {
        const requestId = req.get('X-Request-Id') || generateId();
        res.set('X-Request-Id', requestId);

        namespace.run(() => {
            namespace.set('requestId', requestId);

            next();
        })
    }
}

const app = express();
const logger = cLogger.logger;

app.use(clsRequestId(logger.cls, cuid));

app.get('/', async (req, res) => {
    const result = await handler();

    return res.json(result);
})

app.listen(PORT, () => {
    logger.info({
            endpoint: `http://localhost:${PORT}`
        },
        'App is running!'
    )
})

function delay(timeoutMs) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, timeoutMs);
    })
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function handler() {
    const namespace = logger.cls;

    logger.info( 'Before')
    test3();
    await delay(randomInteger(1000, 10000));
    test3();
    logger.info( 'Middle')
    await delay(randomInteger(1000, 10000));
    logger.info( 'After')
    test3();
    return {};
}
