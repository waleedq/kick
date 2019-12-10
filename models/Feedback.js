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
    request: { type: mongooseSchema.Types.ObjectId, ref: 'Request' },
    subject: {type: String, required: true},
    body: {type: String, required: true},
    __v: {type: Number, select: false}
  }, { toJSON: { virtuals: true } });

  ModelSchema.set('toJSON', {
      transform: function(doc, ret, options) {
          var retJson = {
              id: ret._id,
              subject: ret.subject,
              body: ret.body,
              created_at: ret.created_at,
              updated_at: ret.updated_at,
              links: {
                "lead": "lead",
              }
          };
          return retJson;
      }
  });

  return Mongoose.model('Feedback', ModelSchema);
}

module.exports = new Model();
