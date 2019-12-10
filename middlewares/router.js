var enrouten  = require('express-enrouten');
var kick      = require('includes/kick.js');

module.exports = {
  name: "router",
  weight: 130,
  middleware: function (app) {
    var router = enrouten({directory: kick.uri('controllers')})
    app.use(router);
  }
}
