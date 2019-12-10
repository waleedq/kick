var bodyParser  = require('body-parser');
var expressValidator = require('express-validator');

module.exports = {
  name: "bodyParser",
  middleware: function (app) {
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({
      extended: true,
      limit: '50mb'
    }));
    app.use(expressValidator());
  }
}
