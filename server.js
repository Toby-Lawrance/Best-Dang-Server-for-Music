var express = require('express');
var path = require('path');
var logger = require('./logger');
var admin = require('./admin');
var downloader = require('./download');
var player = require('./player');
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

app.post('/ytd',async function(req,res) {
  logger.log("URL received: " + req.body.url,MEDIUM);
  try {
    var info = await downloader.getVidInfo(req.body.url);
    logger.log("Retrieval successful: " + info.title, HIGH);
    logger.log("Temp playing: " + info.title, DEV);
    let file = await downloader.downloadFromURL(req.body.url);
    logger.log("Got the filename: " + file,HIGH);
    player.play(file);
    res.status(200).send({"title":info.title});
  } catch (e) {
    logger.error("Issue with info" + JSON.stringify(e.message));
    res.status(406).send(JSON.parse("Can't get Info" + JSON.stringify(e.message)));
  }
});

var confport = admin.getPort();

var server = app.listen(confport, function() {
  var host = server.address().address;
  var port = server.address().port;
  logger.log("Server listening at http://"+host+":"+port,LOW);
});
