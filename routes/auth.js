var express = require('express');
var router = express.Router();
const { version } = require('../package.json');

/* GET home page. */

const loginRouter = router.get('/', function(req, res, next) {
  // console.log('Auth routh id %s %o',req.id,req);
  res.render('login', { title: `Login - ${version}` });
});

module.exports.login = loginRouter;
