var connect = require('connect');
var path = require('path');

var app = connect()
    .use(connect.static(path.resolve(__dirname, 'public')));

module.exports = app;
