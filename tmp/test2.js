var express = require('express')
var kerberos = require('../modules/kerberos')
var addRequestId = require('express-request-id')();

var app = express()
var kbServer = null
var port = 3000

app.use(addRequestId);

console.log(`---- STARTING SERVER ----`);
kerberos.principalDetails('HTTP', "sm.gorodperm.ru")
.then((details) => {
console.log("Principal:", details);
})
.catch(error => {
console.log("Failed to read principal", error);
});

console.log(`Init kerberos`);
kerberos.initializeServer("HTTP@sm.gorodperm.ru")
.then((server) => {
kbServer = server;
console.log(`Kerberos server initialized:`, server);
console.log(`Start webserver on port ${port}`)
app.listen(port);
})
.catch((error) => {
console.log("Failed:", error);
});
 
app.get('/', function (req, res) {
    
        
        console.log('Start---------------------------------------------------------------------------------%s %o',req.id, req.headers.host);
        var auth = req.headers['authorization'];
        if (auth) {
         console.log('-1. - authorization');
          var token = auth.replace("Negotiate ", "");
          console.log('----2.  Step token %o', {kbServer,token});
          kbServer.step(token)
            .then(serverResponse => {
                console.log('-------3. Kerberos answer %o', kbServer);
                res.setHeader('WWW-Authenticate', 'Negotiate ' + kbServer.response);
                if (kbServer.contextComplete && kbServer.username) {
                    console.log('-----------4.  Auth ok', kbServer.contextComplete);
                    kbServer.step('YIIIIQYGKwYBBQUCo').then(data => console.log('----------reset status %o ',data)).catch(err =>  console.log('----------catch reset status %o ',err));
                    return res.end(`Hello ${kbServer.username}!`);
                } else {
                    
                    kbServer.step('').catch(err => {console.log('----------finish err %o req.id %o kbServer %o',err, req.id,kbServer);});
                    res.statusCode = 401;
                    res.setHeader('WWW-Authenticate', 'Negotiate');
                    return res.end(' ');
                }
            }).catch(err => {
                res.statusCode = 500;
                console.log('----------finish err %o req.id %o kbServer %o',err, req.id,kbServer);
                console.trace("Error")
                res.end(err.message);
            });
        
        } else {
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Negotiate');
            return res.end(' ');
        }
    
});


module.exports = app;