var connect = require('connect');
var path = require('path');

var app = connect()
    .use(path.resolve(__dirname, connect.static('public')));

module.exports = app;
