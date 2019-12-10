var JwtStrategy               = require('passport-jwt').Strategy,
    ExtractJwt                = require('passport-jwt').ExtractJwt,
    kick                      = require('includes/kick.js'),
    passport                  = require('passport'),
    PassportLocalStrategy     = require('passport-local').Strategy;

module.exports = {
  name: "passport-jwt",
  weight: -1,
  middleware: function (app) {
    var User = require('models/User.js');
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = kick.config('site:secret');

    var authStrategy = new JwtStrategy(opts, function(jwt_payload, done) {
        User.findOne({_id: jwt_payload.id}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    })

    app.use(passport.initialize());
    passport.use(authStrategy);
  }
}
