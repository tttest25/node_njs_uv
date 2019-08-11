'use strict';

const composable = require('composable-middleware');
const expressAuthNegotiate = require('express-auth-negotiate').default;
const NestedError = require('nested-error-stacks');

console.log(expressAuthNegotiate);

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

const isWin = (process.platform)==='win32';
if (isWin) {
    module.exports.Kerberos = {username:'Eugen'}; 
    console.log('Windows');
} else {
    console.log('Linux');
}

    const kerberos= require('../kerberos');

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
            module.exports.kbServer = server;
            console.log(`Kerberos server initialized:`, server);
        })
        .catch((error) => {
            throw new Error(`Failed kerberos initializeServer ${error}`);
        });


    

    module.exports.Kerberos = kerberos; 


async function simpleKerberos(token) {
    kbServer.step(token)
        .then(serverResponse => {
            console.log('-------3. Kerberos answer %o', kbServer);
            res.setHeader('WWW-Authenticate', 'Negotiate ' + kbServer.response);
            if (kbServer.contextComplete && kbServer.username) {
                console.log('-----------4.  Auth ok', kbServer.contextComplete);
                kbServer.step('YIIIIQYGKwYBBQUCo').then(data => console.log('----------reset status %o ', data)).catch(err => console.log('----------catch reset status %o ', err));
                return `${kbServer.username}`;
            } else {
                kbServer.step('').catch(err => {
                    console.log('----------finish err %o req.id %o kbServer %o', err, req.id, kbServer);
                });
            }
        }).catch(err => {
            console.log('----------finish err %o req.id %o kbServer %o', err, req.id, kbServer);
            console.trace("Error")
        });
}



module.exports = () => composable()
.use(expressAuthNegotiate())
.use((req, res, next) => {
    simpleKerberos(req.auth.token)
    .then(username => {
        req.auth.username = username;
        next();
    }, next);
});