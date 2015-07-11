var config = require('./config');
var mysql = require('mysql');

process.on('uncaughtException', function (err) {
    console.log('Exception:', err);
});

var mysqlPool = mysql.createPool(config.mysqlPool);

var connectHttp = require('connect')();

connectHttp
    .use(require('connect-timeout')(config.web.responseTimeout))
    .use(require('body-parser').json())
    .use(handleRequest)
    .listen(config.web.httpPort, function () {
        console.log('MySQL Proxy is listening on %d', config.web.httpPort)
    });

function handleRequest(req, res) {
    var query = req.body.query;
    var params = req.body.params;

    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (config.web.allowRequestOrigin) {
        res.setHeader('Access-Control-Allow-Origin', config.web.allowRequestOrigin);
    }

    if (req.method !== 'POST') {
        return res.end(JSON.stringify({error: 'Proxy only supports POST requests.'}));
    }

    if (!query) {
        return res.end(JSON.stringify({error: 'Missing query parameter.'}));
    }

    mysqlPool.query(query, params, function (err, rows, fields) {
        res.end(JSON.stringify({error: err, rows: rows, fields: fields}));
    });
}