var enrouten  = require('express-enrouten');
var kick      = require('includes/kick.js');

module.exports = {
  name: "global-router",
  weight: 230,
  middleware: function (app) {
    var router = enrouten({directory: kick.uri('global-controllers')})
    app.use(router);
  }
}
