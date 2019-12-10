var path    = require('path'),
    glob    = require("glob");


function ExpressMiddles(app, fetchPath, sorter) {
  this.middlewares = [];
  this.overrides = {};
  this.fetchPath = fetchPath;
  this.app = app;
  this.compare = sorter || function compare(a,b) {
    if (a.weight < b.weight)
      return -1;
    if (a.weight > b.weight)
      return 1;
    return 0;
  }
}

ExpressMiddles.prototype.run = function (app, fetchPath){
  fetchPath = fetchPath || this.fetchPath;
  app = app || this.app;
  this.middlewares = [];

  var files = glob.sync(fetchPath);

  for(var i in files){
    var file = files[i];
    var middleware = require( path.resolve( file ) );
    if(middleware.autorun !== false){
      if(!middleware.weight) middleware.weight = 0;
      this.middlewares.push(middleware);
    }
  }
  
  this.middlewares.sort(this.compare);
  for(var i = 0; i < this.middlewares.length; i++){
    var mw = this.middlewares[i];
    if(mw && mw.name && this.overrides && this.overrides[mw.name]){
      mw = this.overrides[mw.name]
    }
    if(mw && mw.middleware && typeof mw.middleware == "function"){
      mw.middleware(this.app);
    }
  }
}

ExpressMiddles.prototype.get = function(name, update){
  var fetchPath = this.fetchPath;
  if(fetchPath && update){
    this.middlewares = [];
    var files = glob.sync(fetchPath);

    for(var i in files){
      var file = files[i];
      var middleware = require( path.resolve( file ) );
      if(middleware.autorun !== false){
        if(!middleware.weight) middleware.weight = 0;
        this.middlewares.push(middleware);
      }
    }
  }
  
  if(name){
    for(var i = 0; i < this.middlewares.length; i++){
      var mw = this.middlewares[i];
      if(mw && mw.name && mw.name == name){
        console.log("mw.name", mw.name);
        return mw;
      }
    }
  }
}

ExpressMiddles.prototype.set = function(name, middleware){
  this.overrides[name] = middleware;
}

module.exports = ExpressMiddles;