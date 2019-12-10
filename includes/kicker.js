'use strict';

var path                = require('path'),
    util                = require('util'),
    schedule            = require('node-schedule'),
    kick                = require('includes/kick'),
    nodemailer          = require('nodemailer');

var kicker = {
  _transporters:{
  },
  _handlers: {
    email: function(data, callback){
      var transporter = kicker._transporters.email;
      if(!transporter) return;
      data.from = "Merv <merv@merv.io>"
      data.subject = "Merv: " + data.subject;
      transporter.sendMail(data, function(error, info){
          if(error){
            if(callback && typeof callback == "function"){
              callback(error, info)
            }
          }else{
            if(callback && typeof callback == "function"){
              callback(null, info)
            }
          }
      });
    },
    log: function(data){
      return console.log(data);
    }
  },
  init: function  () {
    this._initEmail();
  },
  send: function (type, data, callback) {
    if(kicker._handlers && kicker._handlers[type]){
      var handler = kicker._handlers[type];
      handler(data, callback)
    }
  },
  _initEmail: function(){
    kicker._transporters.email = nodemailer.createTransport({
      service: kick.config('email:service'),
      auth: {
          user: kick.config('email:username'),
          pass: kick.config('email:password')
      }
    });
  },
  _scheduleJobs: function(){
    Job.find({type:"oneTime", date:{"$gte" : new Date() }}, function(error, jobs){
      if(error) return console.log(error);
      if(jobs.length){
        for(var i in jobs){
          job = jobs[i].toObject();
          kicker.cancelJob(job.name);
          schedule.scheduleJob(job.name, job.date, function(){
            kicker.send(job.handler, job.data, function(){
              Job.findOneAndRemove({name: job.name});
            });
          });
        }
      }
    })    
  },
  pushNotification: function(to, subject, text, callback){
    var mailOptions = "";
    callback = arguments[arguments.length - 1];
    if(typeof arguments[0] == "object"){
      mailOptions = arguments[0];
    } else {
      mailOptions = {
          to: to,
          subject: subject,
          text: text,
      };
    }
    kicker.send("email", mailOptions, callback)
  },
  sendEmail: function(from, to, subject, body, html, callback){
    var mailOptions = "";
    callback = arguments[arguments.length - 1];
    if(typeof from == "object"){
      mailOptions = from;
    } else {
      mailOptions = {
          from: from,
          to: to,
          subject: subject,
          text: body,
          html: html ? html : body
      };
    }
    kicker.send("email", mailOptions, callback)
  },
  addJob: function(name, date, handler, data, type, callback){
    var job = "";
    if(typeof name == 'object'){
      job = new Job(name);
      callback = date;
    }else{
      job = new Job({name: name, date:date, handler: handler, data:data, type: type});
    }
    Job.findOneAndRemove({name: job.name}, function(){
      job.save(function(error, job){
        if(typeof callback == "function"){
          callback();
        }
      })
    });
    schedule.scheduleJob(job.name, job.date, function(){
      //kicker.send(job.handler, job.data, function(error, mailOptions){
        Job.findOneAndRemove({name: job.name});
      //});
    });   
  },  
  cancelJob: function(name){
    Job.findOneAndRemove({name: name});
    schedule.cancelJob(name);
  }
}

module.exports = kicker;