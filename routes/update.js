const { exec } = require('child_process');
var express = require('express');
var router = express.Router();

const cLogger = require('../log');
const logger = cLogger.createChildLogger({module: 'update.js'})

/* UPDATE home page. */
router.get('/', function(req, res, next) {
  exec('"/usr/bin/git" pull', (error, stdout, stderr) => {
    if (error) {
      // logger.error('update.js! app.git_update-mess: %s err:%o',error.message, error);
      error.message = "update.js! Error app.git_update " + error.message;
      return next(error);  
    }
    logger.info(' Result update: git pull-> '+ stdout  +' stderr:' + stderr);
    res.send('<pre> Result update: git pull-> '+ stdout  +' stderr:' + stderr);
  });
  
});

module.exports = router;
