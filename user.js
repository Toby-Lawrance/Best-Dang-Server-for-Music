var logger = require('./logger');

var users = [];

var setAlias = function(ip,alias) {
  if(!users[ip])
  {
    createUser(ip);
  }
  users[ip].alias = alias;
  logger.log("Set users alias: " + JSON.stringify(users[ip]),HIGH);
}

var createUser = function(ip) {
  users[ip] = {ip:ip};

  logger.log("Made a new user: " + JSON.stringify(users[ip]),MEDIUM);
}

var getUser = function(ip) {
  return users[ip];
}

var userExists = function(ip) {
  if(users[ip])
  {
    return true;
  }
  return false;
}

module.exports = {
  setAlias: setAlias,
  createUser: createUser,
  getUser: getUser,
  userExists: userExists
}
