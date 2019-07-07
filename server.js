var express = require('express');
var path = require('path');
var logger = require('./logger');
var admin = require('./admin');
var downloader = require('./download');
logger.log("Instance started",NONE);

const app = express();

app.use(express.static('static'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

app.enable('trust proxy');
app.set('trust proxy','loopback');
app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });

app.get('/', function (req,res) {
  res.sendFile(path.join(__dirname + 'static/index.html'));
});

app.post('/ytd',function(req,res) {
  logger.log("URL received: " + req.body.url,MEDIUM);
  try {
    var info = downloader.getVidInfo(req.body.url);
    res.status(200).send(info.title);
  } catch (e) {
    logger.error("Issue with info" + JSON.stringify(e.message));
    res.status(406).send("Can't get Info" + JSON.stringify(e.message));
  }
});

var confport = admin.getPort();

var server = app.listen(confport, function() {
  var host = server.address().address;
  var port = server.address().port;
  logger.log("Server listening at http://"+host+":"+port,LOW);
});
