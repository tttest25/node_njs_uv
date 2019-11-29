# WEB_Api


[![Build Status](https://travis-ci.org/artsy/artsy.github.io.svg)](https://travis-ci.org/artsy/artsy.github.io)

Project rapid software development (buisness project) platform with Node/PostgreSQL

## Fundamentals

### Architecture

    NodeJS
    ├── Express
    │   └── Routes
    │       ├── Auth (combined login/pass and GSSAPI javascript)
    │       ├── API  (/API mode IN_JSON  postgre * see below)
    │       │   └── 
    │       └── App  (WEB mode in_json -> PG -> PUG -> html/js)
    │       │   └── 
    │       └── Doc
    └── PostgreSQL (PG DB)
        └── DB:WebAPI
            ├── sessioncreate (create session context)
            ├── web_api       (entry point for API mode)
            └── web_api_web   (entry point for WEB mode)


### Api/WEB mode
Process list
User HTTP GET/POST... &#8594; Express /API &#8594; JSON_IN_API{} &#8594; PG web_API &#8594; JSON_OUT_API &#8594; HTTP JSON USER / compile PUG 

    UrlS :
    WEB_APP:
         http://hostname:port/app/mode/submodee/subm1?param1=val1&param2[]=1&debug
    WEB_API:
         http://hostname:port/api/webapi?param1=val1&param2[]=1&debug  (post)

```javascript
// JSON_IN example
{
    "req": {
        "headers": {
            "host": "sm.gorodperm.ru:3000","connection": "keep-alive",
            "upgrade-insecure-requests": "1","user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            "accept-encoding": "gzip, deflate","accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "cookie": "connect.sid=s%3ARsx0iRvITL5jY-Z0LyLcRMueTsrvIofN.26a2fmWwh7bWfvv%2B7uKnmb%2B8kV6AHEOl4kB4LYmzP2M"
        },
        "method": "GET",
        "originalUrl": "/app/uvtemplate/list?debug",
        "params": {
            "0": "vtemplate/list",
            "arr": "u"
        },
        "query": {
            "debug": ""
        },
        "body": {},
        "sessionId": "Rsx0iRvITL5jY-Z0LyLcRMueTsrvIofN"
    },
    "ip": "::ffff:172.17.0.1",
    "username": "melnikov-ea@GORODPERM.RU",
    "mode": "uvtemplate",
    "modes": [
        "list"
    ]
}
```
```javascript
// JSON_OUT_API
{
    "webdata": {
        "data": {
            "tbody": "PUG TEMPLATE",
            "tdata": [
                {
                    "num": 1,
                    "tname": "uv_form_data_in"
                },
            ]
        },
        "type": "pug-debug",
        "status": "1"
    }
}
```


## License

The code in this repository is released under the MIT license. The contents of the blog itself (ie: the contents of
the `_posts` directory) are released
under +[Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

