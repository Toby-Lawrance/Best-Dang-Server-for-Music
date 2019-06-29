var express = require('express');
var path = require('path');
var logger = require('./logger');
var admin = require('./admin');
logger.log("Instance started",NONE);

const app = express();

app.use(express.static('static'));

app.enable('trust proxy');
app.set('trust proxy','loopback');
app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });
app.use(express.json());

app.get('/', function (req,res) {
  res.sendFile(path.join(__dirname + 'static/index.html'));
});

var confport = admin.getPort();

var server = app.listen(confport, function() {
  var host = server.address().address;
  var port = server.address().port;
  logger.log("Server listening at http://"+host+":"+port,LOW);
});
