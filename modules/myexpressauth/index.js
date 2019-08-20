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
    logger.error('Start on Linux OS');
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
        logger.debug(' KRB.clear ----catch reset status %s',err);
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
        console.error(' simpleKerberos auth error ', error, kbServer) ;
        return undefined;
    }
}



module.exports = () => composable()
    .use(expressAuthNegotiate())
    .use((req, res, next) => {
        simpleKerberos(req.auth.token)
            .then(username => {
                req.auth.username = username;
                logger.debug('Auth id - URL %s  ID %s Username %s ',req.url, req.id,username);
                next();
            }, next);
    });