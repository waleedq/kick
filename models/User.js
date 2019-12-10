'use strict';
var Mongoose        = require('mongoose'),
    bcrypt          = require('bcrypt'),
    validate        = require('mongoose-validator'),
    Schema          = require('models/BaseSchema'),
    mongooseSchema  = Mongoose.Schema,
    async           = require('async'),
    kick            = require('includes/kick'),
    _               = require('underscore');

var emailValidator = [
  validate({validator: 'isLength', arguments: [6, 50], message: "Email Address should be between 6 and 64 characters"}),
  validate({validator: 'isEmail', message: "Email Address is not correct"})
];

function Model() {
  var ModelSchema = new Schema({
    fullname: {type: String},
    username: {type: String, required: true,  unique: true},
    email: {type: String, validate: emailValidator, lowercase: true,  unique: true},
    password: {type: String, select: false, required: true},
    phone: {type: String},
    emailConfirmed: Boolean,
    confirmationToken: String,
    passwordResetTokenId: String,
    country: String,
    isAdmin: Boolean,
    roles: {},
    lastLocation: {},
    firebaseToken: String,
    __v: {type: Number, select: false}
  }, { toJSON: { virtuals: true } });

  ModelSchema.set('toJSON', {
      transform: function(doc, ret, options) {
          var retJson = {
              id: ret._id,
              fullname: ret.fullname,
              username: ret.username,
              phone: ret.phone,
              email: ret.email,
              country: ret.country,
              created_at: ret.created_at,
              updated_at: ret.updated_at,
              lastLocation: ret.lastLocation,
              firebaseToken: ret.firebaseToken ? ret.firebaseToken : "",
              links: {
              }
          };
          return retJson;
      }
  });

  ModelSchema.virtual('id').get(function() {
    return this._id;
  });


  ModelSchema.virtual('files', {
    ref: 'File',
    localField: '_id',
    foreignField: 'user',
  });

  ModelSchema.virtual('feedbacks', {
    ref: 'Feedback',
    localField: '_id',
    foreignField: 'user',
  });


  ModelSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.hash(user.password, 10, function(err, hash) {
      user.password = hash;
      next();
    });
  });

  ModelSchema.pre('findOneAndUpdate', function (next) {
    var doc = this;
    const password = this.getUpdate().password;
    if (!password) {
        return next();
    }
    bcrypt.hash(password, 10, function(err, hash) {
      doc.findOneAndUpdate({}, {password: hash});
      next();
    });
  });

  ModelSchema.statics.authenticate = function(username, password, callback) {
    var username = new RegExp(["^", kick.regExpEscape(username), "$"].join(""), "i");
    this.findOne({ "username": username}).select('+password').exec(function(error, user) {
      if (user) {
        bcrypt.compare(password, user.password, function (err, isMatch) {
          if (isMatch) {
            return callback(null, user);
          }else{
            return callback({ message:"Invalid username or password."}, null);
          }
        })
      } else if (!user) {
        // Email or password was invalid (no MongoDB error)
        callback({ message:"Invalid username or password."}, null);
      } else {
        // Something bad happened with MongoDB. You shouldn't run into this often.
        callback(error, null);
      }
    });
  };

  return Mongoose.model('User', ModelSchema);
}

module.exports = new Model();
