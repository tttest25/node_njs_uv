'use strict';

const isWin = (process.platform)==='win32';


if (isWin) {
    module.exports.Kerberos = {username:'Eugen'}; 
} else {
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
}

