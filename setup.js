require('./constants.js');
const admin = require('./admin');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.stdoutMuted = true;


var pass = "";
var prom = rl.question('Enter new password: ', function(password) {
  admin.setPassword(password);
  pass = password;
  rl.stdoutMuted = false;
  rl.close();
  //DEV section
  console.log("Test: " + admin.checkPassword(pass));

});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("*");
  else
    rl.output.write(stringToWrite);
};
