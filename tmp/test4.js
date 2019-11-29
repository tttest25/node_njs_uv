'use strict';

const express = require('express');
const cuid = require('cuid');
const cLogger = require('../log');
const test3 = require('./test3');


const pino = require('pino')
cLogger.logger
.child({a: 'property'})
.child({a: 'prop'})
.info('howdy')

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
