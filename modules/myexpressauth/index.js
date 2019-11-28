"use strict";

const composable = require('composable-middleware');
const expressAuthNegotiate = require('express-auth-negotiate').default;
const NestedError = require('nested-error-stacks');

const cLogger = require('../../log');
const logger = cLogger.createChildLogger({module: 'myexpressauth'})


/**
* Class for Error Kerberos
*/
class SimpleKerberosError extends NestedError {
    constructor(message, nested) {
        super(message, nested); /* istanbul ignore next https://github.com/gotwarlost/istanbul/issues/690 */
        Object.assign(this, nested);
        this.name = 'SimpleKerberosError';
    }
}

let kbServer = null;

// Check platform
const isWin = (process.platform) === 'win32';
if (isWin) {
    module.exports.Kerberos = {
        username: 'Eugen'
    };
    logger.debug('Start on Windows');
} else {
    logger.debug('Start on Linux OS');
}

const kerberos = require('../kerberos');

logger.debug(`---- Kerberos STARTING SERVER ----`);
kerberos.principalDetails('HTTP', "sm.gorodperm.ru")
    .then((details) => {
        logger.debug("Principal:", details);
    })
    .catch(error => {
        logger.error("Failed to read principal", error);
        throw new SimpleKerberosError('simpleKerberos Failed to read principal stage', error);
    });

logger.debug(`Init kerberos`);
kerberos.initializeServer("HTTP@sm.gorodperm.ru")
    .then((server) => {
        kbServer = server;
        module.exports.kbServer = kbServer;
        logger.debug(`Kerberos server initialized:`, server);
    })
    .catch((error) => {
        throw new SimpleKerberosError('simpleKerberos Failed kerberos initializeServer', error);
    });




module.exports.Kerberos = kerberos;

function clearKrb(pkbServer) {
    pkbServer.step('YIIIIQYGKwYBBQUCo').then(data => logger.debug('3. ---reset status %o ', data)).catch(err => {
        logger.trace(' KRB.clear ----catch reset status %s',err);
        pkbServer.username = undefined;
        pkbServer.contextComplete = false;
    });
}

async function simpleKerberos(token) {
    try {
    let username = await kbServer.step(token)
        .then(serverResponse => {
            logger.debug('-- 1. Kerberos answer %o', { kbServer, serverResponse });
            // res.setHeader('WWW-Authenticate', 'Negotiate ' + kbServer.response);
            if (kbServer.contextComplete && kbServer.username) {
                let userName='';
                logger.info('-- 2.  Auth ok', kbServer.contextComplete,kbServer.username);
                userName=`${kbServer.username}`
                clearKrb(kbServer);
                return userName;
            } else {
                let errStr=`simpleKerberos "STEP"  auth  not done ${kbServer.contextComplete} ${kbServer.username}`;
                clearKrb(kbServer);
                throw new SimpleKerberosError(errStr, new Error('Not authorized'));
            }
        }).catch(err => {
            // logger.debug('----------finish err %o  kbServer %o', err, kbServer);
            clearKrb(kbServer);
            throw new SimpleKerberosError('simpleKerberos on stage "STEP" error ', err);
        });
    return username;
    } catch (error) {
        logger.error(' simpleKerberos auth error ', error, kbServer) ;
        throw new SimpleKerberosError('simpleKerberos on stage "STEP" error ', error);
    }
}


// example KerberosCheckPassword = (username, password) 
//


const  myKerberosCheckPassword = ((req, res, next) => {
    let username = req.body.username || 'def';
    let password = req.body.password || 'def';
    // Normalize username
    username = username.includes('@GORODPERM.RU')? username:username.concat('@GORODPERM.RU'); 
    return kerberos.checkPassword(username, password, 'HTTP/sm.gorodperm.ru','GORODPERM.RU')
    .then((data) => {
        logger.info('Login/Pass - success  ',username,data);
        req.auth = req.auth || {};
        req.session = req.session || {};
        req.auth.username = username;
        req.session.username = username;
        next();
    })
    .catch((err) => {
        logger.error('Login/Pass - error :',username, err.message);
        res.render('login', { title: `Login - error`, error:  err.message}) 
        // next(err);
    });   
});



const myKerberos = () => composable()
.use(expressAuthNegotiate())
.use((req, res, next) => {
    simpleKerberos(req.auth.token)
        .then(username => {
            req.auth.username = username;
            req.session.username = username;
            logger.debug('Auth successfully - URL %s  ID %s Username %s ',req.originalUrl, req.id,username);
            next();
        }, next);
});


module.exports.myKerberos = myKerberos;
module.exports.myKerberosCheckPassword = myKerberosCheckPassword;