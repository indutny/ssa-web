var connect = require('connect');
var path = require('path');
var http = require('http');

var app = connect()
    .use(connect.static(path.resolve(__dirname, 'public')));

module.exports = http.createServer(app);
