var express = require('express');
var path = require('path');
var logger = require('./logger');
var admin = require('./admin');
var downloader = require('./download');
var player = require('./player');
var bucks = require('./buckets');
var users = require('./user');
var cors = require('cors');
var multer = require('multer');
logger.log("Instance started",NONE);

const app = express();

app.use(cors());
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

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +file.originalname )
  }
});



app.get('/', function (req,res) {
  res.status(200).sendFile(path.join(__dirname + 'static/index.html'));
});

app.post('/alias',async function(req,res) {
  if(!users.userExists(req.ip)) {users.createUser(req.ip);}
  logger.log("Received Alias request: " + JSON.stringify(req.body),HIGH);
  if(req.body.alias)
  {
    users.setAlias(req.ip,req.body.alias);
    res.status(200).send(req.body);
  } else {
    res.status(418).send("Send something?");
  }
});

app.post('/ytd',async function(req,res) {
  logger.log("URL received: " + req.body.url,MEDIUM);
  try {
    if(!users.userExists(req.ip)) {users.createUser(req.ip);}

    var info = await downloader.getVidInfo(req.body.url);
    logger.log("Retrieval successful: " + info.title, HIGH);
    res.status(200).send({"title":info.title});
    bucks.uploadYTVideo(req.body.url,req.ip,null);
  } catch (e) {
    logger.error("Issue with info" + JSON.stringify(e.message));
    res.status(406).send(JSON.parse("Can't get Info" + JSON.stringify(e.message)));
  }
});

var upload = multer({storage: storage});
app.post('/file', upload.single('file'), async function(req,res) {
  if(!users.userExists(req.ip)) {users.createUser(req.ip);}
  const file = req.file;
  if(!file)
  {
    const err = new Error("Please upload a file");
    logger.error("Upload issue: " + JSON.stringify(err));
    return res.status(500).json(err);
  }
  bucks.uploadFileVideo(res.req.file.filename,req.ip,null);
  return res.status(200).send(req.file);
});

app.post('/queue', function(req,res) {
  if(!users.userExists(req.ip)) {users.createUser(req.ip);}
  let buckets = bucks.getQueue();
  if(buckets.length < 1)
  {
    buckets.push([]);
    logger.log("Padding buckets response: " + JSON.stringify(buckets),HIGH);
  }
  return res.status(200).json({"buckets":buckets});
});

var confport = admin.getPort();

var server = app.listen(confport, function() {
  var host = server.address().address;
  var port = server.address().port;
  logger.log("Server listening at http://"+host+":"+port,LOW);
});
