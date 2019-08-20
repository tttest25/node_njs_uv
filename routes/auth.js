var express = require('express');
var routerLogin = express.Router();
var routerLogout = express.Router();
const { version } = require('../package.json');
const {myKerberosCheckPassword} = require ('../modules/myexpressauth')

/* GET home page. */

routerLogin.get('/', function(req, res, next) {
  // console.log('Auth routh id %s %o',req.id,req);
  res.render('login', { title: `Login - ${version}` });
});

routerLogin.post('/', myKerberosCheckPassword, function(req, res, next) {
  // console.log('Auth routh id %s %o',req.id,req);
  if (req.session.username) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

routerLogout.get('/', function(req, res, next) {
  // console.log('Auth routh id %s %o',req.id,req);
  delete req.session.username;
  res.render('login');
});

module.exports.login = routerLogin;
module.exports.logout = routerLogout;
