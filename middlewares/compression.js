var compression = require('compression');

module.exports = {
  name: "compression",
  middleware: function (app) {
    app.use(compression());
  }
}