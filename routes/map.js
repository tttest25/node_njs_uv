var express = require('express');
var router = express.Router();
const { version } = require('../package.json');
// var db = require('../db');
// const pug = require('pug');
// var path = require('path');


const cLogger = require('../log');
const logger = cLogger.createChildLogger({module: 'map.js'})

/* GET home page. */
router.get('/', function(req, res, next) {
  let name = req.auth.username || 'Anonymous';
  // let name = 'Anonymous';
  // console.log('Auth routh id %s %o',req.id,req);
  res.render('map', { title: `HeatMap - ${version} - ${name}` });
});


module.exports = router;
