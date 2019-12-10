var path    = require('path'),
    glob    = require("glob");


function SocektIOMiddles(socket, fetchPath, sorter) {
  this.events = [];
  this.overrides = {};
  this.fetchPath = fetchPath;
  this.socket = socket;
  this.compare = sorter || function compare(a,b) {
    if (a.weight < b.weight)
      return -1;
    if (a.weight > b.weight)
      return 1;
    return 0;
  }
}

SocektIOMiddles.prototype.run = function (socket, fetchPath){
  fetchPath = fetchPath || this.fetchPath;
  socket = socket || this.socket;
  this.events = [];

  var files = glob.sync(fetchPath);

  for(var i in files){
    var file = files[i];
    var event = require( path.resolve( file ) );
    if(event.autorun !== false){
      if(!event.weight) event.weight = 0;
      this.events.push(event);
    }
  }

  this.events.sort(this.compare);
  for(var i = 0; i < this.events.length; i++){
    var ev = this.events[i];
    if(ev && ev.name && this.overrides && this.overrides[ev.name]){
      ev = this.overrides[ev.name]
    }
    if(ev && ev.event && typeof ev.event == "function"){
      ev.event(this.socket);
    }
  }
}

SocektIOMiddles.prototype.get = function(name, update){
  var fetchPath = this.fetchPath;
  if(fetchPath && update){
    this.events = [];
    var files = glob.sync(fetchPath);

    for(var i in files){
      var file = files[i];
      var event = require( path.resolve( file ) );
      if(event.autorun !== false){
        if(!event.weight) event.weight = 0;
        this.events.push(event);
      }
    }
  }

  if(name){
    for(var i = 0; i < this.events.length; i++){
      var ev = this.events[i];
      if(ev && ev.name && ev.name == name){
        return ev;
      }
    }
  }
}

SocektIOMiddles.prototype.set = function(name, event){
  this.overrides[name] = event;
}

module.exports = SocektIOMiddles;
