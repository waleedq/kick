'use strict';

var Mongoose        = require('mongoose'),
    validate        = require('mongoose-validator'),
    Schema          = require('models/BaseSchema'),
    mongooseSchema  = Mongoose.Schema,
    async           = require('async'),
    kick            = require('includes/kick'),
    _               = require('underscore');

function Model() {
  var ModelSchema = new Schema({
    user: { type: mongooseSchema.Types.ObjectId, ref: 'User' },
    refId: { type: mongooseSchema.Types.ObjectId },
    name: String,
    path: String,
    type: String,
    size: String,
    attributes: {},
    __v: {type: Number, select: false}
  }, { toJSON: { virtuals: true } });

  return Mongoose.model('File', ModelSchema);
}

module.exports = new Model();
