'use strict';

var db = {
  connect: function(options) {
   
    var db = require('thinky')(options);
    var promise = db.dbReady();
    promise.then(function(){
      console.log("db connection", options);
    })
    return db;
  }
};
module.exports = db;