var compression = require('compression');
var kickout = require('includes/kickout');
module.exports = {
  name: "cors",
  middleware: function (app) {
    app.options('*',function(req, res, next) {
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS")
      res.header("Access-Control-Allow-Origin", kickout.getAllowedOrigin(req.headers.origin));
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials");
      res.json();
    });
    app.use('*', function(req, res, next) {
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS")
      res.header("Access-Control-Allow-Origin", kickout.getAllowedOrigin(req.headers.origin));
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials");
      next();
    });
  }
}
