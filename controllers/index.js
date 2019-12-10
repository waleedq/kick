'use strict';

var kick    = require('includes/kick.js');
var kicker  = require('includes/kicker.js');

module.exports = function (router) {
  router.get('/', function (req, res) {
    return res.json({});
  });
};
