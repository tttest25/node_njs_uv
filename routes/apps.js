'use strict';

var express = require('express');
var router = express.Router();
// const { version } = require('../package.json');
var db = require('../db');
const pug = require('pug');
var path = require('path');


const cLogger = require('../log');
const logger = cLogger.createChildLogger({module: 'apps.js'})

// WEB_API_WEB - MiddleWare for process param
router.param('arr', async (req, res, next, mode) => {
  try {
    let oReq = cLogger.objectSerializer(req, ['method', 'originalUrl', 'remoteAddress', 'remotePort', 'headers', 'body', 'query', 'params']);
    oReq.sessionId = req.session.id;
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var modes = [].concat(req.params[0].split('/').slice(0));
    mode = mode+modes.shift();
    let ObjectParams = Object.assign({}, {
      req: oReq,
      ip: ip,
      username: req.session.username,
      mode,
      modes
      // , statusCode: statusCode
    });
    res.locals.ObjectParams = ObjectParams;
    
    // Work with DB
    res.locals.Result = await db.webApiWeb(ObjectParams);
    
    // #DEBUG move to trace
    logger.debug('APPS.JS Process param in:%o -> out:%o', ObjectParams,res.locals.Result )
    next()
  } catch (error) {
    next(error);
  }
})

// stub 
router.get('/', async (req, res, next) => {
  try {
    res.render('apps', { title: `Application` });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    next(e) 
  }
})

// WEB_API_WEB - route for 
router.all('/(:arr)*', (req, res, next) => {
  
  let webdata = res.locals.Result.webdata || {};
  let dtype = webdata.type || 'none';
  let data = webdata.data || {tbody:`ERROR: There is no tbody, see ?debug : pre.  ${JSON.stringify(res.locals.Result)} `};
  let tbody = data.tbody || {};
  let tdata = data.tdata || {};
  let error;
  
  logger.trace(`APPS.JS entry point /app/${dtype} route`);
  switch(dtype) {
    case 'pug':
        res.status(200).send(pug.render(tbody, {data: tdata, filename: "web_api", basedir: path.join(__dirname, '../views')}));
      break;
    case 'pug-debug':
        res.status(200).json(Object.assign({}, {objParams: res.locals.ObjectParams, objResult: res.locals.Result}));
      break; 
    default:
        // Error no mode for process
        // res.status(500).json(Object.assign({}, {objParams: res.locals.ObjectParams, objResult: res.locals.Result}));
        logger.error( 'APPS.JS!ERROR no supported(only pug/pug-debug) data.type %o  ', {resLocals: res.locals});
        error = new Error(`APPS.JS!ERROR no supported data.type - returned ${dtype}`);
        error.httpStatusCode = 500
        return next(error)
  }
  
});


module.exports = router;