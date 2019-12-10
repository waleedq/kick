var kick          = require('includes/kick.js'),
    session       = require('express-session'),
    mongoStore    = require('connect-mongo')(session),
    mongoose      = require('mongoose');

module.exports = {
  name: "session",
  weight: -2,
  middleware: function (app) {
    var storeOptions = {
      mongooseConnection: mongoose.connection,
      autoRemove: 'native',
      touchAfter: 24 * 3600
    }
    var sessionStore = new mongoStore(storeOptions);

    var appSession = app.use(session({
        store: sessionStore,
        secret: kick.config('site:secret'),
        maxAge: null,
        key: kick.config('site:skey'),
        saveUninitialized: false,
        resave: false,
        cookie: { 
          expires: new Date(Date.now() + 379468800000)
        }
      })
    );
  }
}