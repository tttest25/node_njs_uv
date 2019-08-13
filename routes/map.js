var express = require('express');
var router = express.Router();
const { version } = require('../package.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  let name = req.auth.username || 'Anonymous';
  res.render('map', { title: `Heat - ${version} - ${name}` });
});

module.exports = router;
