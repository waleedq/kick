var kickout = require('includes/kickout.js');
module.exports = {
  name: "authentication",
  middleware: function (app) {
    app.use('/', kickout.isAuthenticated());
  } 
}
