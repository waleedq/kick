var flash = require('flash');
module.exports = {
  name: "flash",
  middleware: function (app) {
    app.use(flash());
    app.get('/*', function(req,res,next) {
      req.session.flash = [];
      next();
    });
  }
}