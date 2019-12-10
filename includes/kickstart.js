'use strict';

var express                   = require('express'),
    path                      = require('path'),
    dustjs                    = require('adaro'),
    //dustHelper                = require('includes/dust-helper')(dustjs),
    nconf                     = require('nconf'),
    mongoDB                   = require('includes/mongodb.js'),
    io                        = require('socket.io'),
    kick                      = require('includes/kick.js'),
    kicker                    = require('includes/kicker.js'),
    cookieParser              = require("cookie-parser"),
    glob                      = require("glob"),
    ExpressMiddles            = require("includes/express-middles"),
    SocektIOEvents            = require("includes/socketio-events"),
    favicon                   = require('serve-favicon'),
    admin                     = require('firebase-admin');

//Models
var Feedback        = require('models/Feedback');
var File            = require('models/File');
var User            = require('models/User');

var kickstart = {
  app: null,
  server: null,
  run: function(){
    this._init();
    return this.server;
  },
  _init: function() {
    this._loadConfigs();
    var db = this._initDB();
    kick.db = db;
    this._initExpress();
    kicker.init();
  },
  _initFirebase: function(){
    var serviceAccount = require(kick.uri('config/serviceAccountKey.json'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    kick.firebase = admin;
  },
  _init_cli: function() {
    this._loadConfigs();
    var db = this._initDB();
    kick.db = db;
    return db;
  },
  _loadConfigs: function() {
    var configFile = process.env.NODE_ENV || 'default';
    nconf.file(kick.uri('config/' + configFile + '.json'));
  },
  _initHelpers: function(dust) {
    if (!dustjs.helpers) dustjs.helpers = {};
    glob.sync( kick.uri('helpers') + '/**/*.js' ).forEach( function( file ) {
      require( path.resolve( file ) )(dust, this.app);
    }.bind(this));
  },
  _initExpress: function() {
    var app = express();
    var expressMiddles = new ExpressMiddles(app, kick.uri('middlewares') + '/**/*.js');
    this.app = app;
    this.server = this.app.listen(process.env.PORT || kick.config('site:port'), function () {
      console.log(kick.config('site:name') + ' is ready!');
      console.log(kick.config('site:baseUri'));
    });

    this._initSocketIo(this.server);
    this.initExpressViews();

    expressMiddles.run();
  },
  _initAWS: function() {
    AWS.config.loadFromPath(kick.uri("config/aws-config.json"));
    kick.AWS = AWS;
  },
  _initDB: function() {
    return mongoDB.connect(kick.config('db:mongo:host'), kick.config('db:mongo:port'), kick.config('db:mongo:dbname'));
  },
  _initSocketIo: function(app, session){
    var ws = io(app);
    kick.ws = ws;
    ws.on("connection", function(socket){
      var socketIOEvents = new SocektIOEvents(socket, kick.uri('socket-io-events') + '/**/*.js');
      socketIOEvents.run();
    })
  },
  initExpressViews: function() {
    var dust = dustjs.dust({ cache: false, helpers: [
      function (dust) {
        this._initHelpers(dust)
      }.bind(this)
    ]});
    this.app.engine('dust', dust);
    this.app.set('view engine', 'dust');
    this.app.set('views', kick.uri('views'));
  },
}

module.exports = kickstart;
