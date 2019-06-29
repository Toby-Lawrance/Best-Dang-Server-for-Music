var fs = require('fs');
var jsonfile = require('jsonfile');
var path = require('path');
const conffile = 'config.json';
var config = jsonfile.readFileSync(conffile, function (err,obj) {
  if(err) console.error(err);
});
var loggingLevel = config.LogLevel;
var path = __dirname + "\\logs\\log_"+ getTimeStamp() +".log"
try {
  fs.writeFileSync(path,"");
} catch (e) {
  console.error("Unable to write to log because: "+ e);
}

function getTimeStamp()
{
  date = new Date();
  year = date.getFullYear();
  month = date.getMonth()+1;
  day = date.getDate();
  hour = date.getHours();
  mins = date.getMinutes();
  seconds = date.getSeconds();
  return day + "-" + month + "-" + year + "_" + hour + "h." + mins + "m." + seconds + "s";
}

function willLog(request)
{
  return LogLevels.indexOf(request) <= LogLevels.indexOf(loggingLevel);
}

var writeLogLine = function(message,type,level)
{
  var msg = "["+type+"] ["+level+"] " + getTimeStamp() + ": " + JSON.stringify(message,null,2) + '\n';
  try {
    fs.appendFileSync(path, msg);
    type === LOG ? console.log(msg) : console.error(msg);
  } catch (e) {
    console.error("Unable to write to log because: "+ e + " to say:" + message);
  }
}

var log = function (message,level)
{
  if(!willLog(level)) {return false;}
  writeLogLine(message,LOG,level);
}

var error = function (message)
{
  writeLogLine(message,ERR,LogLevels[LogLevels.length - 1]);
}

module.exports = {
  log: log,
  error: error,
}
