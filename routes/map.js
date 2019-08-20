var express = require('express');
var router = express.Router();
const { version } = require('../package.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  let name = req.auth.username || 'Anonymous';
  // let name = 'Anonymous';
  // console.log('Auth routh id %s %o',req.id,req);
  res.render('map', { title: `Heat - ${version} - ${name}` });
});

module.exports = router;
