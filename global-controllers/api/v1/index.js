'use strict';

var passport    = require('passport');
var User        = require('models/User.js');
var Hash        = require('password-hash');
var kick        = require('includes/kick');
var kickout     = require('includes/kickout');
var async       = require('async');
var uuid        = require('uuid');
var pluralize   = require('pluralize')

module.exports = function (router) {

  router.get('/:model/:id?', function (req, res, next) {
    var id = req.params.id;
    var modelName = pluralize.singular(req.params.model);
    var ModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    if(ModelName && !id){
      var Model = require('models/' + ModelName);
      if(Model){
        Model.find().sort({created_at: -1}).then(function (data) {
          var json = {};
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
    }else if(ModelName && id){
      var Model = require('models/' + ModelName);
      if(Model){
        Model.findOne({_id: id}).then(function (data) {
          var json = {};
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
  });

  router.put('/:model/:id', function (req, res, next) {
    var id = req.params.id;
    var modelName = pluralize.singular(req.params.model);
    var ModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
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
            var json = {};
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

  router.delete('/:model/:id', function (req, res, next) {
    var id = req.params.id;
    var modelName = pluralize.singular(req.params.model);
    var ModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    if(ModelName && id){
      var Model = require('models/' + ModelName);
      if(Model){
        Model.findOne({_id: id}).then(function (data) {
          Model.remove({_id: id}).then(function (obj) {
            var json = {};
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

  router.post('/:model', function (req, res, next) {
    var modelName = pluralize.singular(req.params.model);
    var ModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    var modelData = req.body[modelName];
    if(ModelName && modelData){
      var Model = require('models/' + ModelName);
      if(Model){
        var model = new Model(req.body[modelName]);
        model.validate(function (error) {
          console.log("error", error);
          var errors = kick.validation(error);
          if(errors){
            res.status(422);
            res.json(errors);
          } else {
            model.save().then(function (data) {
              Model.findOne({_id: data._id}).then(function (data) {
                var json = {};
                json[modelName] = data;
                return res.json(json);
              });
            }).error(function (error) {
              res.status(403);
              console.log("error", error);
              return res.json({error});
            })
          }
        });
      }else{
        res.status(422);
        return res.json({});
      }
    }else{
      res.status(422);
      return res.json({});
    }
  });

  router.get('/:model/:id/:dataName', function (req, res, next) {
    var id = req.params.id;
    var dataName = req.params.dataName;
    var dataModelName = pluralize.singular(req.params.dataName);
    var modelName = pluralize.singular(req.params.model);
    var ModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    var dataModelName = dataModelName.charAt(0).toUpperCase() + dataModelName.slice(1);
    var dataModelRefName = dataModelName;
    if(ModelName && id && dataModelName){
      var Model = require('models/' + ModelName);
      var modelSchema = Model.schema;
      if(modelSchema.paths[req.params.dataName] && modelSchema.paths[req.params.dataName].options && modelSchema.paths[req.params.dataName].options.ref){
        var dataRefName = modelSchema.paths[req.params.dataName].options.ref;
        var dataModelRefName = pluralize.singular(dataRefName);
        var dataModelRefName = dataModelRefName.charAt(0).toUpperCase() + dataModelRefName.slice(1);
      }
      if(modelSchema.virtuals[req.params.dataName] && modelSchema.virtuals[req.params.dataName].options && modelSchema.virtuals[req.params.dataName].options.ref){
        var dataRefName = modelSchema.virtuals[req.params.dataName].options.ref;
        var dataModelRefName = pluralize.singular(dataRefName);
        var dataModelRefName = dataModelRefName.charAt(0).toUpperCase() + dataModelRefName.slice(1);
      }
      var dataModel = require('models/' + dataModelRefName);
      if(Model && dataModel){
        if(!dataName || !Model.canPopulate(dataName)){
          res.status(422);
          return res.json({});
        }
        Model.findOne({_id: id}).populate({"path": dataName, options: { sort: {created_at:-1}}}).then(function (data) {
          if(!data){
            res.status(422);
            return res.json({});
          }
          var json = {};
          json[dataName] = data[dataName];
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
  });

}
