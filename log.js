'use strict';
const clsCreateLogger = require('./modules/logger/logger.js');
var serializers = require('pino-std-serializers')

// Symbol for set time 
var startTime = Symbol('startTime');


//** Option for Pino logger with setializers */
var opts = opts || {}
opts.serializers = opts.serializers || {}
opts.serializers.req = serializers.wrapRequestSerializer(opts.serializers.req || serializers.req)
opts.serializers.res = serializers.wrapResponseSerializer(opts.serializers.res || serializers.res)
opts.serializers.err = serializers.wrapErrorSerializer(opts.serializers.err || serializers.err);

const LOG_LEVEL=process.env.LOG_LEVEL || 'info';
// let logger = clsCreateLogger({level: LOG_LEVEL, serializers:opts.serializers});
let logger = clsCreateLogger({level: LOG_LEVEL });


function createLogger(...params) {
    logger = clsCreateLogger(params)
    return logger;
}

function createChildLogger(param) {
    return logger.child(param);
}

/** Function for create Serializer from object {obj1,obj2,...,objn} + [obj1,objn] = {obj1,objn} */
function objectSerializer(raw,allowed) {
    // const raw = { item1: { prop: '1' }, item2: { prop: '2' }, item3: { prop: '3' } };
    // const allowed = ['item1', 'item3'];

    const filtered = Object.fromEntries(
        Object.entries(raw).filter(
            ([key, val]) => allowed.includes(key)
        )
    );
    return filtered;
}

// for logging express 
function onResFinished (err) {
    this.removeListener('error', onResFinished)
    this.removeListener('finish', onResFinished)

    var  vUrl=this.req.originalUrl.toLowerCase();

    // skip public and favicon finished log
    if (vUrl.includes('favicon') || vUrl.includes('images') || vUrl.includes('stylesheets') || vUrl.includes('javascript')) { return }
    
    var log = this.log
    var responseTime = Date.now() - this[startTime]
    var level = 'info'; //customLogLevel ? customLogLevel(this, err) : useLevel
    
    
    let oReq = objectSerializer(this.req,['method','originalUrl','remoteAddress','remotePort','headers']);
    // let oRes = {statusCode: this.statusCode};
    let ip = this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress;
    let ObjectParams = Object.assign( {} ,
         {  req: oReq 
          , ip: ip 
          , username: this.req.session.username
          , statusCode: this.statusCode
          , responseTime: responseTime
         }
        );
    

    if (err || this.err || this.statusCode >= 500) {
    log[level]({
        obj: ObjectParams,
        res: this.statusCode,
        err: err || this.err || new Error('failed with status code ' + this.statusCode),
        responseTime: responseTime
    }, '=== request errored')
    return
    }
 
    log[level](ObjectParams, `=== request completed on ${responseTime}ms from ${this.req.originalUrl} by ${this.req.session.username}(${ip})`)

    ObjectParams=oReq=ip=null;
}

function loggingMiddleware (req, res, next) {
    res[startTime] = res[startTime] || Date.now()
    // if (!req.res) { req.res = res }
    // Set logger in/req res in  clsRequestId middleware app.js
    //req.log = res.log = logger;

    res.on('finish', onResFinished)
    res.on('error', onResFinished)

    if (next) {
    next()
    }
}

module.exports = {
    objectSerializer,
    // createLogger,
    createChildLogger,
    logger,
    loggingMiddleware,
    startTime
};