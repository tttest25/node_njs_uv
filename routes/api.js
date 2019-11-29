'use strict';

var express = require('express');
var router = express.Router();
var db = require('../db');

const cLogger = require('../log');
const logger = cLogger.createChildLogger({module: 'routes-api'});


// example of error wrapper
const handleErrorAsync = func => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        res.status(500).json({ error: error.toString(), status: 0,data: [],message: error.stack , originalUrl:req.originalUrl});
        // next(error);
    }
};

/*
function wrapAsync(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    };
    }

    // right method of async
const asyncMiddleware = fn =>
(req, res, next) => {
    Promise.resolve(fn(req, res, next))
    .catch(next);
};
*/

/**
 * Old way of api to remove
 */
router.post('/webApi/', db.webApi);
router.get('/id/:id', db.getSingle);
router.get('/get_claims_by_geo_fts', handleErrorAsync(db.get_claims_by_geo_fts));



// WEB_API_API - MiddleWare for process param
router.param('arr', async (req, res, next, mode) => {
    try {
        let oReq = cLogger.objectSerializer(req, ['method', 'originalUrl', 'remoteAddress', 'remotePort', 'headers', 'body', 'query', 'params']);
        oReq.sessionId = req.session.id;
        oReq.reqId = res.get('X-Request-Id');
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var modes = [].concat(req.params[0].split('/').slice(0));
        mode = mode + modes.shift();
        res.locals.mode=mode;
        let ObjectParams = Object.assign({}, {
            req: oReq,
            ip: ip,
            username: req.session.username,
            mode,
            modes
            // , statusCode: statusCode
        });
        res.locals.ObjectParams = ObjectParams;

        // #DEBUG move to trace
        logger.debug('API.JS API2 Execute :/api/%o ', mode);
        logger.trace('API.JS API2 --> params in:%o -> out:%o', ObjectParams, res.locals.Result);

        // Work with DB
        res.locals.Result = await db.webApi2(ObjectParams);

        next()
    } catch (error) {
        next(error);
    }
})
    

// WEB_API_API - route for  /api/*
router.all('/(:arr)*', (req, res, next) => {
    let Result = res.locals.Result;
    logger.debug(`API.JS entry point /api/${res.locals.mode||'Unknown'} route`, Result);

    if (Result && Result.apidata && Result.apidata.error) {
        // If error send error
        let error = new Error(`DB url ${res.locals.mode||'Unknown'}: `.concat(Result.apidata.error));
        next(error);
    } else {
        res.status(200).json({
            status: 1,
            data: res.locals.Result,
            message: `success Api - ${res.locals.mode||'None'}`
        });
    }

});

// router.all('*', asyncMiddleware(async (req, res, next) => {  res.status(404).json({ error: "Not found".toString(), status: 'error',data: [],
router.all('*', async function(req, res) { res.status(404).json({ error: "WEB_API mode URL not found", status: 0,data: [],message: 'WEB_API Error mode Not Found:'+req.originalUrl })});
router.use(function (err, req, res, next) {
    logger.error(err.stack);
    let error=err;
    res.status(500).json({ error: "!WEB_API: " + error.toString(), status: 0 ,data: [],message: error.stack , originalUrl:req.originalUrl});
});


module.exports = router;
