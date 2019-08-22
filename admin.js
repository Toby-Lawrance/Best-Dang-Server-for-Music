var fs = require('fs');
var logger = require('./logger');
var jsonfile = require('jsonfile');
const crypto = require('crypto');
const conffile = 'config.json';
var config = jsonfile.readFileSync(conffile, function (err,obj) {
  if(err) console.error(err);
});

banned = {};
loggedIn = {};

module.exports = {
  getConfig: function() {
    return config;
  },

  getPort : function () {
    return config.Port;
  },

  getBucketLength: function() {
    return config.bucketLength;
  },

  checkPassword: function(attempt,ip) {
    if(loggedIn[ip])
    {
      return loggedIn[ip];
    }
    const salt = config.salt;
    var attemptHashed = crypto.createHash('sha256').update(salt + attempt).digest('base64');
    if (attemptHashed.toString() === config.pass.toString())
    {
      logger.log("Log in made","MEDIUM");
      var logInToken = crypto.randomBytes(64).toString('hex');
      loggedIn[ip] = logInToken;
      return logInToken;
    }
    logger.log("Log-in attempt failed: " + attemptHashed + " actual: " + config.pass,"DEV");
    return null;
  },

  setPassword: function(pass) {
    const time = Date.now();
    var salty = crypto.createHash('sha256').update(time.toString()).digest('base64');
    var passHashed = crypto.createHash('sha256').update(salty + pass).digest('base64');
    var updates = {salt:salty,pass:passHashed};
    config.salt = updates.salt;
    config.pass = updates.pass;
    jsonfile.writeFileSync(conffile,config);
  },

  isloggedIn: function(logIp,logInToken) {
    return loggedIn[logIp] == logInToken;
  },

  addBan: function(banIp,logIp,loginToken) {
    if(this.isloggedIn(logIp,loginToken))
    {
      banned[banIp] = true;
      logger.log("Banned a user: " + banIp,LOW);
    }
  },

  checkBan: function(ip,loginToken) {
    if(banned[ip])
    {
      logger.log("Banned user attempted to request song",MEDIUM);
      return true;
    }
    return false;
  },




}
