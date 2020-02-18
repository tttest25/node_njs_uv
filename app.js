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

var authRouter = require('./routes/auth');
var indexRouter = require('./routes/index');
var docRouter = require('./routes/doc');
var apiRouter = require('./routes/api');
var appsRouter = require('./routes/apps');
var updateRouter = require('./routes/update');


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
  req.session = req.session || {};
  // logger.info(`CheckUser - req.session.username ${req.session.username} req.session.id ${req.session.id}  'X-Request-Id' ${res.get('X-Request-Id')}`);
  if (req.session.username) {
    req.session.prevUrl='/';
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
    // save url for use
    req.session.prevUrl = req.originalUrl;
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
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: false}));
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

// Set GoogleApiKey for google services
app.locals.googleApiMaps = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&libraries=visualization&callback=initMap`;

app.use(express.static(path.join(__dirname, 'public')));

// Debug url
app.use( function(req, res, next) {
  logger.info('Request URL:', req.originalUrl);
  next();
}
);

// System auth routers
app.get('/login', (req, res, next) => { res.render('login', { title: `Login - ${version}` }) });
// app.post('/login', expressKerberos.myKerberosCheckPassword,(req, res, next) => { SessionCreate(req.session.username,'pass',req.session.id).then(() => res.redirect('/')).catch(() => res.redirect('/'))});
// app.use('/kerberos', expressKerberos.myKerberos(), (req, res, next) => { SessionCreate(req.session.username,'kerberos',req.session.id).then(() => res.redirect('/')).catch(() => res.redirect('/'))});
app.post('/login', expressKerberos.myKerberosCheckPassword,(req, res, next) => { 
  SessionCreate(res, req.session.username,'pass',req.session.id).then(
    () => {
      if(req.session.prevUrl) res.redirect(req.session.prevUrl);
      else res.redirect('/');
    }
  ).catch(next)
});

app.use('/kerberos', expressKerberos.myKerberos(), (req, res, next) => {
  SessionCreate(res, req.session.username, 'kerberos', req.session.id).then(
    () => {
      if(req.session.prevUrl) res.redirect(req.session.prevUrl);
      else res.redirect('/');
    }
  ).catch(next)
});

app.use('/logout', authRouter.logout);

// index router+ middlware for all routes loadUser
app.use('/', loadUser, indexRouter);

// Documents
app.use('/doc', docRouter);

// Api Routes - webapi example
app.use('/api', apiRouter);
// WebApp Routes - pug html example
app.use('/app', appsRouter);

app.use('/update', updateRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  logger.error('APP.JS - main error mess: %s err:%o',err.message, err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500)
  ;
  res.render('error');
});

 logger.info('Start - version %s',process.env.npm_package_version);
 logger.info(' Config: app.locals.googleApiKey : %s ...', app.locals.googleApiMaps.substring(0, 10));

module.exports = app;
