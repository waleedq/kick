'use strict';

var mongoose = require('mongoose');

var db = {
  connect: function(server, port, dbname, user, pwd) {
    console.log(`server = ${server} with port = ${port} to dbname = ${dbname}`);
    mongoose.Promise = require('bluebird');
    if(user && pwd) {
      mongoose.connect(`mongodb://${user}:${pwd}@${server}:${port}/${dbname}`, {useMongoClient: true});
    } else {
      mongoose.connect(`mongodb://${server}:${port}/${dbname}`, {useMongoClient: true});
    } 
    
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log('db connection open!')
    });
    return db;
  }
};
module.exports = db;