'use strict';

var createError = require('http-errors');
var express = require('express');
var path = require('path');
// var cookieParser = require('cookie-parser');
var session = require('express-session');
var pgSession = require('connect-pg-simple')(session);
const {db,SessionCreate} = require('./db')
const cuid = require('cuid');
const cLogger = require('./log');

const { version } = require('./package.json');

var expressKerberos = require('./modules/myexpressauth');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mapRouter = require('./routes/map');
var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');


/**
 * Logger Function set id to context logger
  */
function clsRequestId(namespace, generateId) {
  return (req, res, next) => {
      const requestId = req.get('X-Request-Id') || generateId();
      res.set('X-Request-Id', requestId);
      
      namespace.bindEmitter(req);
      namespace.bindEmitter(res);

      namespace.run(() => {
          req.log=res.log=logger;
          namespace.set('requestId', requestId);
          logger.trace({requestId,url: req.url},'--- NameSpace-run set request ID');
          next();
      })
  }
}

// check user and set user
function loadUser(req, res, next) {
  logger.trace(logger.cls.active,'LoadUser - middleware - Loggerclsactive');
  // logger.info(`CheckUser - req.session.username ${req.session.username} req.session.id ${req.session.id}  'X-Request-Id' ${res.get('X-Request-Id')}`);
  if (req.session.username) {
    req.auth={};
    req.auth.username=req.session.username;
    logger.cls.set('sessionID', req.session.id);
    next();
    /*User.findById(req.session.user_id, function(user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/sessions/new');
      }
    });
    */
  } else {
    res.redirect('/login');
  }
}

var app = express();
// const logger = cLogger.logger;
const logger = cLogger.createChildLogger({module: 'app.js'})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(logger('dev'));
app.use(clsRequestId(logger.cls, cuid)); // Create  Continuation-Local Storage to store data in session in threads 
app.use(cLogger.loggingMiddleware); // middleware for loggin 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(session({
  store: new pgSession({
    //pool : pgPool,                // Connection pool
    pgPromise : db,
    tableName : 'web_sessions',   // Use another table-name than the default "session" one
    schemaName: 'webapi',
  }),
  secret: process.env.COOKIE_SECRET,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
})
);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res, next) => { res.render('login', { title: `Login - ${version}` }) });
app.post('/login', expressKerberos.myKerberosCheckPassword,(req, res, next) => { SessionCreate(req.session.username,'pass',req.session.id).then(() => res.redirect('/')).catch(() => res.redirect('/'))});
app.use('/kerberos', expressKerberos.myKerberos(), (req, res, next) => { SessionCreate(req.session.username,'kerberos',req.session.id).then(() => res.redirect('/')).catch(() => res.redirect('/'))});
app.use('/logout', authRouter.logout);


app.use('/', loadUser, indexRouter);

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
  logger.error('Error',err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500)
  ;
  res.render('error');
});

 logger.info('Start - version %s',process.env.npm_package_version);

module.exports = app;
