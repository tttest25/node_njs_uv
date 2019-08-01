'use strict';

var express = require('express');
var router = express.Router();
var db = require('../db');

const handleErrorAsync = func => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        res.status(500).json({ error: error.toString(), status: 'error',data: [],message: error.stack , originalUrl:req.originalUrl});
        // next(error);
    }
};
function wrapAsync(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    };
    }

router.get('/id/:id', db.getSingle);
router.get('/get_topics', db.get_topics);
router.get('/get_geo_by_topic', db.get_geo_by_topic);
router.get('/get_geo_by_topic_fts', handleErrorAsync(db.get_geo_by_topic_fts));
router.get('/get_claims_by_geo', handleErrorAsync(db.get_claims_by_geo));
router.get('/get_claims_by_geo_fts', handleErrorAsync(db.get_claims_by_geo_fts));

router.get('*', async function(req, res) { res.status(500).json({ error: "Not found".toString(), status: 'error',data: [],message: 'Not Found:'+req.originalUrl })});

module.exports = router;