var express = require('express'),
    kick    = require('includes/kick.js');
    
module.exports = {
  name: "staticServer",
  weight: -3,
  middleware: function (app) {
    app.use('/public',express.static(kick.uri('public'), {etag: false}));
    app.use('/assets',express.static(kick.uri('public/assets'), {etag: false}));
  }
}
