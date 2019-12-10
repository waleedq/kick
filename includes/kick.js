'use strict';

var path                = require('path'),
    util                = require('util'),
    nconf               = require('nconf');

var kick = {
  sessionStore: "",
  rootPath: path.dirname(require.main.filename),
  ws: "",
  aws: "",
  codiaClient: "",
  randomColor: function(){
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
  },
  uri: function(location) {
    location = location || '.';
    return path.resolve(path.join(this.rootPath, location))
  },
  titleToMachine: function(text){
    var machineName = text.toLowerCase();
    machineName = machineName.replace(/[\s]/g, "");
    machineName = machineName.replace(/[\._]/g, "-");
    return machineName;
  },
  config: function(key, value) {
    if (typeof key != 'undefined') {
      if (typeof value != 'undefined') {
        nconf.set(key, value);
      } else {
        return nconf.get(key);
      }
    }
  },
  regExpEscape: function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  },
  validation: function(error, fieldName){
    var fieldName = fieldName || "";
    var errorCount = 0;

    var customMessages = {
        required: "This field is required",
        enum: "The value couldn't be validated please try again",
        match: "The valuec couldn't be validated please try again"
    }
    if(error && error.name == "ValidationError"){
      var validation = [];

      for(var field in error.errors ){
        if(fieldName && field != fieldName) continue;
        var errorObj = error.errors[field];
        var message = errorObj.message;
        if(customMessages[errorObj.kind]){
          message = customMessages[errorObj.kind];
        }
        var jsonErrorObject = {
          "detail": message,
          "source": {
            "pointer": "/data/attributes/" + field
          }
        };
        validation.push(jsonErrorObject);
        errorCount++;
      }

      if(errorCount) {
        return { errors: validation };
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

module.exports = kick;
