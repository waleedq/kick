var kick                      = require('includes/kick.js'),
    passport                  = require('passport'),
    PassportLocalStrategy     = require('passport-local').Strategy;

module.exports = {
  name: "passport-local",
  weight: -1,
  autorun: false,
  middleware: function (app) {
    var User = require('models/User.js');
    var authSerializer = function(user, done) {
      done(null, user.id);
    };

    var authDeserializer = function(id, done) {
      User.findOne({_id: id}, function(error, user) {
        done(error, user);
      });
    };

    var authStrategy = new PassportLocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, function(email, password, done) {
      User.authenticate(email, password, function(error, user){
        done(null, user, error ? { message: error.message } : null);
      });
    });

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(authStrategy);
    passport.serializeUser(authSerializer);
    passport.deserializeUser(authDeserializer);
  }
}
