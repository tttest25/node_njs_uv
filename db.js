'use strict';
const { version } = require('./package.json');
var pgp = require("pg-promise")(/*options*/);

var db = pgp(process.env.DB_PG_DSN);

const cLogger = require('./log');
const logger = cLogger.createChildLogger({module: 'db.js'})


db.one("SELECT  version() as version,$1 AS value", version)
    .then(function (data) {
        logger.debug("DATA:", data.version, data.value);
    })
    .catch(function (error) {
        logger.error("ERROR:", error);
    });



/**
* SessionCreate -> create 
* @param {*} res - response
* @param {*} pLogin - login
* @param {*} pPassword - pass
* @param {*} pSession - sess
*/
async function SessionCreate(res, pLogin, pPassword, pSession) {
  try {
    const data = await db.one('SELECT * from webapi.SessionCreate(${pLogin},${pPassword},${pSession})', { pLogin, pPassword, pSession })
    let responseTime = Date.now() - res[cLogger.startTime];
    logger.debug({responseTime},`DB:SessionCreate:login ${pLogin} time ${pSession}`);
    return data;
  } catch (error) {
    error.message = "db.js:SessionCreate error " + error.message || '';
    // throw (error);
    throw error;
  }
}

/**
 * webApi -> Function for call WebAPi 
 * @param {*} req - request
 * @param {*} res - response
 * @param {*} next - next callback
 */
async function webApi(req, res, next) {
  try {
    let pJson = JSON.stringify(Object.assign({},req.body,{sessionid:req.session.id||0}));
    const data = await db.one('SELECT webapi.web_api($1) as val', pJson)
    let responseTime = Date.now() - res[cLogger.startTime];
    logger.debug({responseTime},`DB:webApi:${req.body.func} time ${responseTime}ms`);
    res.status(200)
      .json({
        status: 'success',
        data: data.val,
        message: 'webApi'
      });
  } catch (error) {
    error.message = "db.js:webApi error / " + error.message +" / " +error.hint;
    // throw (error);
    return next(error);
  }
}


/**
* webApiWeb -> Function for call WebJSON 
* @param {*} oConf - object config
*/
async function webApiWeb(oConf) {
  try {
    let pJson = JSON.stringify(oConf);
    let responseTime = Date.now()
    // const data = await db.one('SELECT * from uvdata.uv_data_web($1)', pJson)
    const data = await db.one('SELECT webapi.web_api_web($1) as webdata', pJson)
    responseTime = Date.now() - responseTime;
    logger.debug({responseTime},`DB:webApiWeb:${JSON.stringify(data)} time ${responseTime} ms`);
    return data;
  } catch (error) {
    error.message = "DB:webApiWeb error / " + error.message + " / " + error.hint;
    throw (error);
  }
}

function getSingle(req, res, next) {
  var claimID = parseInt(req.params.id);
  db.one('SELECT * FROM public.uv_data where claim_id = $1', claimID)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE row'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function get_topics(req, res, next) {
  // logger.debug("DB:get_topics:");
  db.any('select * from public.get_topics()')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'topics'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function get_geo_by_topic(req, res, next) {
  db.any('select latitude, longitude from public.get_claims_by_topic($1)',  req.query.topic)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'topics'
        });
    })
    .catch(function (err) {
       return next(err);
    });
}

async function get_geo_by_topic_fts(req, res, next) {
  try {
    const data = await db.any(`SELECT latitude, longitude from public.get_claims_by_topic_fts($1,	$2, $3)` ,                 
      [req.query.topic,req.query.text,req.query.month] );
    return res.status(200).json({
      status: 'success',
      data: data,
      message: 'geo_claims_fts'
    });  
  } catch (error) {
    error.message=" db.js:get_geo_by_topic_fts";
    throw (error);
  }
}


async function get_claims_by_geo(req, res, next) {
  try {
    const data = await db.any(`SELECT claim_id,executor,address,topic,create_dt,executor,claim_text from 
    public.get_claims_by_geo('((${req.query.lat}, ${req.query.lng}), ${req.query.radius})',$1)
    `,  [req.query.topic]);
    return res.status(200).json({
      status: 'success',
      data: data,
      message: 'topics'
    });  
  } catch (error) {
    error.message=" db.js:get_claims_by_geo";
    throw (error);
  }
  
   // success
 

/*
  return db.any(`SELECT claim_id,executor,address,topic,create_dt,executor,claim_text from 
          public.get_claims_by_geo('((${req.query.lat}, ${req.query.lng}), 0.01)',$1)
          `,  req.query.topic)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'topics'
        });
    })
    /*.catch(function (err) {
      throw err;
      // res.status(500).json({ error: err.toString(), status: 'error',data: [],message: 'Not Found:'+req.originalUrl });  
      //  return next(err);
    })*/
    
}

async function get_claims_by_geo_fts(req, res, next) {
  try {
    const data = await db.any(`SELECT claim_id,executor,address,topic,create_dt,executor,claim_text from 
    public.get_claims_by_geo_fts('((${req.query.lat}, ${req.query.lng}), ${req.query.radius})',$1,$2,$3)
    `,  [req.query.topic,req.query.text,req.query.month]);
    return res.status(200).json({
      status: 'success',
      data: data,
      message: 'topics'
    });  
  } catch (error) {
    error.message=" db.js:get_claims_by_geo_fts";
    throw (error);
  }
 
}

async function dbAny(sql) {
  try {
    const data = await db.any(sql);
    return data;  
  } catch (error) {
    error.message+=" db.js:dbAny(error)";
    throw (error);
  }
 
}



module.exports = {
  db: db,
  dbAny: dbAny,
  pgPool: db.$pool,
  SessionCreate: SessionCreate,
  webApi: webApi,
  webApiWeb: webApiWeb,
  getSingle: getSingle,
  get_topics: get_topics,
  get_geo_by_topic: get_geo_by_topic,
  get_claims_by_geo: get_claims_by_geo,
  get_claims_by_geo_fts: get_claims_by_geo_fts,
  get_geo_by_topic_fts: get_geo_by_topic_fts
};