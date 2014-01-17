var connect = require('connect');

var app = connect()
    .use(connect.static('public'));

module.exports = app;
