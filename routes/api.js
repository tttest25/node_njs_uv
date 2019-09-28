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

router.post('/webApi/', db.webApi);
router.get('/id/:id', db.getSingle);
router.get('/get_claims_by_geo_fts', handleErrorAsync(db.get_claims_by_geo_fts));

// router.all('*', asyncMiddleware(async (req, res, next) => {  res.status(404).json({ error: "Not found".toString(), status: 'error',data: [],
router.all('*', async function(req, res) { res.status(404).json({ error: "WEB_API mode URL not found", status: 0,data: [],message: 'WEB_API Error mode Not Found:'+req.originalUrl })});
router.use(function (err, req, res, next) {
    logger.error(err.stack);
    let error=err;
    res.status(500).json({ error: "WEB_API code error" + error.toString(), status: 0 ,data: [],message: error.stack , originalUrl:req.originalUrl});
});


module.exports = router;
