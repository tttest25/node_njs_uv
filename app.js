'use strict';

var createError = require('http-errors');
var express = require('express');
var path = require('path');
// var cookieParser = require('cookie-parser');
var session = require('express-session');
const cuid = require('cuid');
const cLogger = require('./log');

var expressKerberos = require('./modules/myexpressauth');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mapRouter = require('./routes/map');
var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');


/**
 * Function set id to context logger
  */
function clsRequestId(namespace, generateId) {
  return (req, res, next) => {
      const requestId = req.get('X-Request-Id') || generateId();
      res.set('X-Request-Id', requestId);

      namespace.run(() => {
          namespace.set('requestId', requestId);
          next();
      })
  }
}

var app = express();
const logger = cLogger.logger;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(logger('dev'));
app.use(clsRequestId(logger.cls, cuid));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(session({
  secret: 'example', // change to environment
  resave: false,
  saveUnitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/login',authRouter.login);

app.use('/', expressKerberos(),indexRouter);

app.use('/users', usersRouter);
app.use('/map', mapRouter);
app.use('/api', apiRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500)
  ;
  res.render('error');
});

 logger.info('Start - version %s',process.env.npm_package_version);

module.exports = app;
