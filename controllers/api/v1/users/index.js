'use strict';

var passport    = require('passport');
var User        = require('models/User.js');
var Hash        = require('password-hash');
var kick        = require('includes/kick');
var kickout     = require('includes/kickout');
var async       = require('async');
var uuid        = require('uuid');

module.exports = function (router) {
  router.get('/', function (req, res, next) {
    var id = req.params.id;
    var modelName = "User";
    var ModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    if(ModelName && !id){
      var Model = require('models/' + ModelName);
      if(Model){
        if(req.user && req.user.isAdmin){
          Model.find().then(function (data) {
            var json = {message: "", token: ""};
            json[modelName] = data;
            return res.json(json);
          }).error(function (error) {
            res.status(403);
            return res.json({error});
          })
        }else if(req.user && req.user.isSupervisor && req.user.country){
          Model.find({country: req.user.country, isAdmin: {$ne: true}, isSupervisor: {$ne: true}}).then(function (data) {
            var json = {message: "", token: ""};
            json[modelName] = data;
            return res.json(json);
          }).error(function (error) {
            res.status(403);
            return res.json({error});
          })
        }else{
          res.status(422);
          return res.json({});
        }
      }else{
        res.status(422);
        return res.json({});
      }
    }else{
      res.status(422);
      return res.json({});
    }
  });

  router.put('/:id', function (req, res, next) {
    var id = req.params.id;
    var modelName = "user";
    var ModelName = "User";
    var modelData = req.body[modelName];
    if(ModelName && id && modelData){
      var Model = require('models/' + ModelName);
      if(Model){
        Model.findOne({_id: id}).then(function (data) {
          if(!data){
            res.status(422);
            return res.json({});
          }
          if(modelData._id) modelData._id = data._id;
          for(var i in modelData){
            if(i in modelData){
              data[i] = modelData[i];
            }
          }
          data.update().then(function (data) {
            var json = {message: "", token: ""};
            json[modelName] = data;
            return res.json(json);
          }).error(function (error) {
            res.status(403);
            return res.json({error});
          })
        }).error(function (error) {
          res.status(403);
          return res.json({error});
        })
      }else{
        res.status(422);
        return res.json({});
      }
    }else{
      res.status(422);
      return res.json({});
    }
  });

  router.get('/drivers', function (req, res, next) {
    var id = req.params.id;
    var currentUser = req.user;
    User.find({isDriver: true}).then(function (data) {
      var json = {message: "", token: ""};
      json["drivers"] = data;
      return res.json(json);
    }).error(function (error) {
      res.status(403);
      return res.json({error});
    });
  });


  router.get('/:id?', function (req, res, next) {
    var id = req.params.id;
    var currentUser = req.user;
    if(!id){
      if(!currentUser.isAdmin){
        User.findOne({_id: currentUser._id}).then(function (data) {
          var json = {message: "", token: ""};
          json["user"] = data;
          return res.json(json);
        }).error(function (error) {
          res.status(403);
          return res.json({error});
        })
      }else if(currentUser.isAdmin){
        User.find().then(function (data) {
          var json = {message: "", token: ""};
          json["user"] = data;
          return res.json(json);
        }).error(function (error) {
          res.status(403);
          return res.json({error});
        })
      }else{
        res.status(401);
        return res.json({});
      }
    }else if(id){
      if(id == "me"){
        User.findOne({_id: currentUser._id}).then(function (data) {
          var json = {message: "", token: ""};
          json["user"] = data;
          return res.json(json);
        }).error(function (error) {
          res.status(403);
          return res.json({error});
        })
      }else{
        User.findOne({_id: id}).then(function (data) {
          var json = {message: "", token: ""};
          json["user"] = data;
          return res.json(json);
        }).error(function (error) {
          res.status(403);
          return res.json({error});
        })
      }
    }else{
      res.status(422);
      return res.json({});
    }
  });

  router.post('/login', function (req, res, next) {
    var loginInfo = req.body.loginInfo;
    if(!loginInfo || !loginInfo.username || !loginInfo.password){
      var errors = {
        message: "Username and password are required"
      }
      res.status(422);
      res.json(errors);
      
      return;
    }else{
      User.authenticate(loginInfo.username, loginInfo.password, function(error, user){
        if(error){
          res.status(422);
          res.json(error);
          return;
        }else{
          var payload = {id: user.id, key: loginInfo.key || ""};
          var token = kickout.signJwt(payload);
          user.password = "";
          delete user["password"];
          return res.json({message: "Logged in", token: token, user: user});
        }
      });
    }
  });

  router.post('/resetpassword', function (req, res){
    var token = req.body.passwordResetTokenId;
    var email = req.body.email;
    var newPassword = req.body.newPassword;
    var confirmNewPassword = req.body.confirmNewPassword;
    if(token && token != "undefiend" && newPassword && confirmNewPassword && newPassword == confirmNewPassword){
      User.findOne({passwordResetTokenId: token}, function(error, user){
        if(error || !user) {
          res.status(422);
          res.json({});
          return;
        }

        user.password = Hash.generate(newPassword);
        user.passwordResetTokenId = null;
        user.update(function(error, user){
          if(error) {
            res.status(422);
            res.json({});
            return;
          }
          return res.json({});
        });

      });
    }else if(!token && email){
      User.findOne({email: email}, function(error, user){
        if(error){
          res.status(422);
          res.json({});
          return;
        }

        if(!user){
          res.json({});
          return;
        }

        user.passwordResetTokenId = uuid.v4();
        user.update(function(error, user){
          if(error) {
            res.status(422);
            res.json({});
            return;
          }

          var emailId = "reset-password";
          Email.findOne({machineName: emailId}, function(error, email){
            if(error || !email) {
              res.status(422);
              res.json({});
              console.log("error", error);
              return;
            }

            console.log("email", email);
            var baseUrl = kick.config('site:baseUri');
            var helpEmail = "help@kick.com";
            email && email.render({baseUrl: baseUrl, user: user, helpEmail:helpEmail}, user, function(error, subject, html, text, user){
              if(error){
                res.status(422);
                res.json({});
                return;
              }
              var data = {
                to: user.name + " <" + user.email + ">",
                subject: subject,
                text: text,
                html: html
              }
              kicker.sendEmail(data);
              return res.json({});
            });
          })
        });
      });
    }
  });

  router.post('/resendemailactivation', function (req, res){
    var user = req.body.user;
    User.findOne({_id:req.body.id}, function(error, user){
      user.emailConfirmed = false;
      user.confirmationToken = uuid.v4();
      user.update(function(error, user){
        if(error) {
          res.status(422);
          res.json();
          return;
        }
        var emailId = "confirm-email";
        Email.findOne({machineName: emailId}, function(error, email){
          if(error) return;
          if(email){
            var baseUrl = kick.config('site:baseUri');
            var helpEmail = "help@kick.com";
            email && email.render({baseUrl: baseUrl, user: user, helpEmail:helpEmail}, user, function(error, subject, html, text, user){
              var data = {
                to: user.name + " <" + user.email + ">",
                subject: subject,
                text: text,
                html: html
              }
              kicker.sendEmail(data);
            });
          }
        })
        return res.json({user: {}});
      });
    });
  });

  router.post('/changeemail', function (req, res){
    var user = req.body.user;
    User.findOne({_id:req.body.id}, function(error, user){
      if(!user || !Hash.verify(req.body.currentPassword, user.password) || !req.body.newEmail || !req.body.confirmNewEmail || (req.body.newEmail != req.body.confirmNewEmail)){
        res.status(422);
        res.json();
        return;
      }

      if(user.email == req.body.newEmail){
        return res.json({user: user});
      }
      user.email = req.body.newEmail;
      user.emailConfirmed = false;
      user.confirmationToken = uuid.v4();
      user.update(function(error, user){
        if(error) {
          res.status(422);
          res.json();
          return;
        }
        var emailId = "change-email";
        Email.findOne({machineName: emailId}, function(error, email){
          if(error) return;
          if(email){
            var baseUrl = kick.config('site:baseUri');
            var helpEmail = "help@kick.com";
            email && email.render({baseUrl: baseUrl, user: user, helpEmail:helpEmail}, user, function(error, subject, html, text, user){
              var data = {
                to: user.name + " <" + user.email + ">",
                subject: subject,
                text: text,
                html: html
              }
              kicker.sendEmail(data);
            });
          }
        })
        return res.json({user: {}});
      });
    });
  });

  router.post('/changepassword', function (req, res){
    var user = req.body.user;
    User.findOne({_id:req.body.id}, function(error, user){
      if(!user || !Hash.verify(req.body.oldPassword, user.password) || !req.body.newPassword || !req.body.confirmNewPassword || (req.body.newPassword != req.body.confirmNewPassword)){
        res.status(422);
        res.json();
        return;
      }

      user.password = Hash.generate(req.body.newPassword);
      user.update(function(error, user){
        if(error) {
          res.status(422);
          res.json();
          return;
        }
        return res.json({user: {}});
      });
    });
  });

  router.post('/register', function (req, res){
    var user = new User(req.body.user);
    user.emailConfirmed = false;
    user.confirmationToken = uuid.v4();
    user.save(function(error, user){
      if(error) {
        var errors = kick.validation(error);
        console.log("user", errors, error);
        res.status(422);
        res.json(errors);
        return;
      }


      var payload = {id: user.id, key: req.body.key || ""};
      var token = kickout.signJwt(payload);
      return res.json({message: "ok", token: token, user: user});

    });
  });
}
