module.exports = {
  name: "errors",
  middleware: function (app) {
    app.use(function(err, req, res, next) {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });
  }
}