var express = require('express');
var router = express.Router();
const { version } = require('../package.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('map', { title: `Heat - ${version}` });
});

module.exports = router;
