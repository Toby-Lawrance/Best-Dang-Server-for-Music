var logger = require('./logger');
var ytd = require('youtube-dl');
var fs = require('fs');
var child = require('child_process');

var downloadFromURL = function(url)
{
  var video = ytd(url,['--format=18'],{cwd:__dirname});

  var fName = "error.mp4";
  video.on('info',function(info) {
    logger.log('Began downloading: ' + info.title,MEDIUM);
    logger.log('filename: ' + info._filename,HIGH);
    fName = info._filename;
    logger.log('size: ' + info.size,HIGH);
  });

  video.pipe(fs.createWriteStream('tmp/'+fName));

  video.on('end', function() {
    logger.log("Video downloaded",HIGH);
    const vlc = child.spawn('vlc',['--play-and-exit','tmp/'+fName]);

    vlc.on('exit', (code,signal)=> {
      logger.log("Video ended",MEDIUM);
    })
  });
}

var getVidInfo = function(url)
{
  var videoInf;
  const promise = new Promise((resolve,reject) => {
    ytd.getInfo(url,[], function(err,info) {
      if(err) {
        logger.error("Unable to get info: " + JSON.stringify(err));
        reject();
      }
      logger.log("CB has: " + JSON.stringify(videoInf),HIGH);
      videoInf = info;
      resolve();
    } );
  });
  promise.then(inf => videoInf);
  logger.log("Returning: " + JSON.stringify(videoInf),HIGH);
  return videoInf;
}

module.exports = {
  downloadFromURL: downloadFromURL,
  getVidInfo: getVidInfo,
}
