'use strict';
const kerberos = require('../modules/kerberos');
const request = require('request');
const os = require('os');
const SegfaultHandler = require('segfault-handler');


// environment variables
const username = process.env.KERBEROS_USERNAME || 'melnikov-ea';
const password = process.env.KERBEROS_PASSWORD || '';
const realm = process.env.KERBEROS_REALM || 'GORODPERM.RU';
const hostname = process.env.KERBEROS_HOSTNAME || 'sm.gorodperm.ru';
const port = process.env.KERBEROS_PORT || '80';

// principal details
let service ='';
/*
// should lookup principal details on a server
    const expected = `HTTP/${hostname}@${realm.toUpperCase()}`;
    kerberos.principalDetails('HTTP', hostname, (err, details) => {
       console.log('1.should lookup principal details on a server %o ,%o', err, details);
       
    });


// should check a given password against a kerberos server
     service = `HTTP/${hostname}@${realm.toUpperCase()}`;
    kerberos.checkPassword(username, password, service, realm.toUpperCase(), err => {
        console.log('2.use passw ok %o ', err);

    kerberos.checkPassword(username, 'incorrect-password', service, realm.toUpperCase(), err => {
        console.log('3.use wrong passw ERR %o ', err);
    });
    });


*/

// should authenticate against a kerberos server using GSSAPI 
     service = `HTTP@${hostname}`;

    kerberos.initializeClient('HTTP/sm.gorodperm.ru', {principal: 'melnikov-ea@GORODPERM.RU'}, (err, client) => {
        console.log('4. cli %o ', {client:client,err:err});

    //kerberos.initializeServer('HTTP', (err, server) => {
     //   console.log('5. server %o ', {client:client,server:server,err:err});


        client.step('', (err, clientResponse) => {
            console.log('6. clientResponse %o ', clientResponse);

       // server.step(clientResponse, (err, serverResponse) => {
         //   console.log('7. serverResponse %o ', serverResponse);

           // client.step(serverResponse, err => {
             //   console.log(' 8. err %o ', {client:client,server:server,err:err});

               // const expectedUsername = `${username}@${realm.toUpperCase()}`;
          //  });
        //});
        //});
    });
    });
/*

const mechOID = kerberos.GSS_MECH_OID_KRB5;
const principal = 'melnikov-ea@GORODPERM.RU';
kerberos.initializeClient('HTTP/sm.gorodperm.ru', { mechOID }, (err, client) => {
    client.step('', (err, kerberosToken) => {
        console.log('0. header %o ', { Authorization: `Negotiate ${kerberosToken}` });
    });
});



// should authenticate against a kerberos HTTP endpoint'
   // const service = `HTTP@${hostname}`;
    const url = `http://${hostname}:${port}/`;

    // send the initial request un-authenticated
    request.get(url, (err, response) => {
    
        console.log('1. response %o ', response.headers);
    // validate the response supports the Negotiate protocol
    const authenticateHeader = response.headers['www-authenticate'];
    

    // generate the first Kerberos token
    const mechOID = kerberos.GSS_MECH_OID_KRB5;
    kerberos.initializeClient('HTTP/sm.gorodperm.ru@GORODPERM.RU', { mechOID }, (err, client) => {
        

        client.step('', (err, kerberosToken) => {
       
            console.log('2. header %o ', { Authorization: `Negotiate ${kerberosToken}` });
        // attach the Kerberos token and resend back to the host
        request.get(
            { url, headers: { Authorization: `Negotiate ${kerberosToken}` } },
            (err, response) => {
           

            // validate the headers exist and contain a www-authenticate message
            const authenticateHeader = response.headers['www-authenticate'];
        

            // verify the return Kerberos token
            const tokenParts = authenticateHeader.split(' ');
            const serverKerberosToken = tokenParts[tokenParts.length - 1];
            client.step(serverKerberosToken, err => {
                console.log('1. serverResponse %o ', err);
            });
            }
        );
        });
    });
});

*/