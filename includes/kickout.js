'use strict';
var _           = require("lodash");
var kick        = require("includes/kick");
var jwt         = require('jsonwebtoken');
var passport    = require('passport');

var kickout = {
  noneAuthenticatedPaths: [
    {method: "POST", path: "api/v1/users/login"},
    {method: "POST", path: "api/v1/users/register"},
    "/public",
    "/api/v1/vars",
    "^/dashboard",
    "^/$"
  ],
  allowedOrigins: [
    "http://labs.livemena.com:9200",
    "http://127.0.0.1"
  ],
  signJwt: function(payload){
    var token = jwt.sign(payload, kick.config('site:secret'));
    return token;
  },
  getAllowedOrigin: function(origin){
    if(kickout.allowedOrigins.indexOf(origin) > -1){
      return origin;
    }else{
      return kickout.allowedOrigins[0];
    }
  },
  isAuthenticated: function() {
    return function(req, res, next){
      if(req.method == "OPTIONS"){
        return next();
      }
      var path = req.path;
      var noneAuthenticatedPathTest = _.find(kickout.noneAuthenticatedPaths, (noneAuthenticatedPath) => {
        if(typeof noneAuthenticatedPath === 'object' && noneAuthenticatedPath.method && noneAuthenticatedPath.path){
          var regExp = new RegExp(noneAuthenticatedPath.path, "gi");
          return (req.method == noneAuthenticatedPath.method) && regExp.test(path);
        }else if(typeof noneAuthenticatedPath === 'string'){
          var regExp = new RegExp(noneAuthenticatedPath, "gi");
          return regExp.test(path);
        }
      });


      if(!noneAuthenticatedPathTest){
        passport.authenticate('jwt', { session: false }, function(err, user, info) {
          if (err) { return res.status(401).end(); }
          if (!user) { return res.status(401).end(); }
          req.user = user;
          return next();
        })(req, res, next);
      }else{
        next();
      }
    }
  }
}

module.exports = kickout;
