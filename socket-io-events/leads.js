var enrouten  = require('express-enrouten');
var kick      = require('includes/kick.js');
var Feedback      = require('models/Feedback.js');
module.exports = {
  name: "example",
  event: function (socket) {
    socket.on("exampleAddModel", function(data, cb){
      if(data){
        feedback = new Feedback(data);
        feedback.save().then(function (feedback) {
          if(typeof cb == "function"){
            cb(null, feedback);
          }
        }).catch(function(error){
          if(typeof cb == "function"){
            cb(error, null);
          }
        });
      }else{
        if(typeof cb == "function"){
          cb("Please provide lead data", null);
        }
      }
    })
  }
}
