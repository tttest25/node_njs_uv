'use strict';
const cLogger = require('../log');

const logger = cLogger.createChildLogger({module: 'test3'})

module.exports =  () => {logger.info( 'test3 print');}

