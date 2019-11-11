const { exec } = require('child_process');
var express = require('express');
var router = express.Router();

/* UPDATE home page. */
router.get('/', function(req, res, next) {
  exec('"/usr/bin/git" pull', (error, stdout, stderr) => {
    if (error) {
      error.message = "app.git_update / " + error.message +" / " +error.hint;
      return next(error);  
    }
    res.send('Result update: git pull-> '+ stdout  +' stderr:' + stderr);
  });
  
});

module.exports = router;
