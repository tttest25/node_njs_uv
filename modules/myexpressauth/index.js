"use strict";

const composable = require('composable-middleware');
const expressAuthNegotiate = require('express-auth-negotiate').default;
const NestedError = require('nested-error-stacks');

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
    console.log('Start on Windows');
} else {
    console.log('Start on Linux OS');
}

const kerberos = require('../kerberos');

console.log(`---- Kerberos STARTING SERVER ----`);
kerberos.principalDetails('HTTP', "sm.gorodperm.ru")
    .then((details) => {
        console.log("Principal:", details);
    })
    .catch(error => {
        console.log("Failed to read principal", error);
        throw new Error(`Failed to read principal ${error}`);
    });

console.log(`Init kerberos`);
kerberos.initializeServer("HTTP@sm.gorodperm.ru")
    .then((server) => {
        kbServer = server;
        module.exports.kbServer = kbServer;
        console.log(`Kerberos server initialized:`, server);
    })
    .catch((error) => {
        throw new Error(`Failed kerberos initializeServer ${error}`);
    });




module.exports.Kerberos = kerberos;

function clearKrb(pkbServer) {
    pkbServer.step('YIIIIQYGKwYBBQUCo').then(data => console.log('3. ---reset status %o ', data)).catch(err => {
        console.log(' KRB.clear ----catch reset status %s',err);
        pkbServer.username = '';
        pkbServer.contextComplete = false;
    });
}

async function simpleKerberos(token) {
    kbServer.step(token)
        .then(serverResponse => {
            console.log('-- 1. Kerberos answer %o', { kbServer, serverResponse });
            // res.setHeader('WWW-Authenticate', 'Negotiate ' + kbServer.response);
            if (kbServer.contextComplete && kbServer.username) {
                let userName='';
                console.log('-- 2.  Auth ok', kbServer.contextComplete,kbServer.username);
                userName=`${kbServer.username}`
                clearKrb(kbServer);
                return userName;
            } else {
                clearKrb(kbServer);
            }
        }).catch(err => {
            // console.log('----------finish err %o  kbServer %o', err, kbServer);
            clearKrb(kbServer);
            console.error(' KRB.step err %o  kbServer %o', err, kbServer)
        });
}



module.exports = () => composable()
    .use(expressAuthNegotiate())
    .use((req, res, next) => {
        simpleKerberos(req.auth.token,res)
            .then(username => {
                req.auth.username = username;
                next();
            }, next);
    });