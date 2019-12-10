'use strict';

var mongoose            = require('mongoose'),
    mongooseSchema      = mongoose.Schema,
    util                = require('util'),
    uniqueValidator     = require('mongoose-unique-validator');

require('mongoose-relationships');

function BaseSchema() {
  mongooseSchema.apply(this, arguments);

  this.add({
    created_at    : { type: Date },
    updated_at    : { type: Date }
  });

  this.plugin(uniqueValidator, {message: "{PATH} is already in use, please choose a new one."});
  this.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
      this.created_at = now;
    }
    next();
  });

  this.pre('update', function(next){
    var now = new Date();
    this.updated_at = now;
    if(this.revs && this.revs.length){
      for(var i=0; i < this.revs.length; i++){
        var rev = this.revs[i];
        rev.updated_at = now;
      }
    }
    next();
  });
/*  if (!this.options.toObject) this.options.toObject = {};
  this.options.toObject.transform = function (doc, ret, options) {
    if(ret.__v) delete ret.__v;
  }*/

  this.statics.canPopulate = function (fieldName) {
    var schema = this.schema;
    if(schema.paths && schema.paths[fieldName] && schema.paths[fieldName].options.ref){
      return true;
    }
    if(schema.virtuals && schema.virtuals[fieldName] && schema.virtuals[fieldName].options.ref){
      return true;
    }
    return false;
  }
  this.methods.doUpdate = function(data, upsert, keys ,callback) {
    var doc = this;
    var model = doc.constructor;
    var query = {_id: doc._id};
    var now = new Date();

    if(!upsert && typeof upsert != "function") upsert = false;
    if(typeof upsert == "function") callback = upsert;
    if(typeof keys == "function") callback = keys;
    if(typeof data == "function") callback = data;

    var update = ((data && callback) && typeof data != "function") ? data : doc.toObject();
    delete update._id;
    update.updated_at = now;

    if(keys && typeof keys != "function"){
      query = {}
      for(var key in keys){
        if(doc[keys[key]]) query[keys[key]] = doc[keys[key]];
      }
    }



    if (this.isModified('_id'))
      return (callback && callback("_id prop can't be modefid before update.")) || "_id prop can't be modefid before update.";
    if(callback && typeof callback == "function"){
      return model.findOneAndUpdate(query, update, {upsert: upsert}, function (err, doc) {
        callback && callback(err, doc);
      })
    }else{
      return model.findOneAndUpdate(query, update, {upsert: upsert});
    }

  };

  this.methods.update = function(data, upsert, keys ,callback) {
    var doc = this;
    var model = doc.constructor;
    var query = {_id: doc._id};
    var now = new Date();

    if(!upsert && typeof upsert != "function") upsert = false;
    if(typeof upsert == "function") callback = upsert;
    if(typeof keys == "function") callback = keys;
    if(typeof data == "function") callback = data;

    var update = ((data && callback) && typeof data != "function") ? data : doc.toObject();
    delete update._id;
    update.updated_at = now;

    if(keys && typeof keys != "function"){
      query = {}
      for(var key in keys){
        if(doc[keys[key]]) query[keys[key]] = doc[keys[key]];
      }
    }



    if (this.isModified('_id'))
      return (callback && callback("_id prop can't be modefid before update.")) || "_id prop can't be modefid before update.";
    if(callback && typeof callback == "function"){
      return model.findOneAndUpdate(query, update, {new: true, upsert: upsert}, function (err, doc) {
        callback && callback(err, doc);
      })
    }else{
      return model.findOneAndUpdate(query, update, {new: true, upsert: upsert});
    }

  };

  this.methods.remove = function(keys, callback) {
    var doc = this;
    var update = doc.toObject();
    var model = doc.constructor;
    var query = {_id: doc._id};

    if(typeof keys == "function") callback = keys;
    if(keys && typeof keys != "function"){
      query = {}
      for(var key in keys){
        if(doc[keys[key]]) query[keys[key]] = doc[keys[key]];
      }
    }

    if (this.isModified('_id'))
      return (callback && callback("_id prop can't be modefid before removing doc.")) || "_id prop can't be modefid before removing doc.";

    model.findOneAndRemove(query, {}, function (err, doc) {
      callback && callback(err, doc);
    })
  };
}

util.inherits(BaseSchema, mongooseSchema);



module.exports = BaseSchema;
