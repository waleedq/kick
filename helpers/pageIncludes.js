var fs = require('fs');
var kick = require('includes/kick.js');

module.exports = function (dust, app) {
  
  app.use(function (req, res, next) {
    dust.helpers.pathStyles = function (chunk, context, bodies, params) {
      var styles = [];
      var path = req.originalUrl.replace(/^\//, "");
      path = path.replace(/\//g, "-");
      var style = kick.uri('public/css/'+ path + ".css");
      if (fs.existsSync(style)) {
        return chunk.write('<link rel="stylesheet" href="/public/css/' + path +'.css" type="text/css">');
      }
      return;
    };

    dust.helpers.pathScripts = function (chunk, context, bodies, params) {
      var scripts = [];
      var path = req.originalUrl.replace(/^\//, "");
      path = path.replace(/\//g, "-");
      var style = kick.uri('public/js/'+ path + ".js");
      if (fs.existsSync(style)) {
        return chunk.write('<script src="/public/js/' + path +'.js"></script>');
      }
      return;
    };
    next();
  });
};
