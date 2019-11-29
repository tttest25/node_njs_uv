var express = require('express');
var router = express.Router();
//const { version } = require('../package.json');
var showdown = require('showdown');
var converter = new showdown.Converter();
var fs = require('fs');



const cLogger = require('../log');
const logger = cLogger.createChildLogger({module: 'doc.js'})

/* GET home page. */
router.get('/', function(req, res, next) {
 
    fs.readFile(__dirname + '/../docs/index.md', 'utf-8', function(err, data) {
      if (err) {next(err);}
      else {
      res.send(converter.makeHtml(data));
      }
    });

});






module.exports = router;
