'use strict';
const clsCreateLogger = require('./modules/logger/logger.js');

let logger = clsCreateLogger({level: 'trace'});

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