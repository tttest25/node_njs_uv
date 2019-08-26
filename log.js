'use strict';
const clsCreateLogger = require('./modules/logger/logger.js');

// Symbol for set time 
var startTime = Symbol('startTime')

const LOG_LEVEL=process.env.LOG_LEVEL || 'info';
let logger = clsCreateLogger({level: LOG_LEVEL});

function createLogger(...params) {
    logger = clsCreateLogger(params)
    return logger;
}

function createChildLogger(param) {
    return logger.child(param);
}



module.exports = {
    createLogger,
    createChildLogger,
    logger
};