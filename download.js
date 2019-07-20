var logger = require('./logger');
var ytd = require('youtube-dl');
var fs = require('fs');
var child = require('child_process');

var downloadFromURL = async function(url)
{
  var video = ytd(url,['--format=18'],{cwd:__dirname});

  const Infopromise = new Promise((resolve,reject) => {
      video.on('info', function(info) {
        resolve(info);
      });
  });

  let info = await Infopromise;
  let fName = Date.now() + '-' + info._filename;

  video.pipe(fs.createWriteStream('tmp/'+ fName));

  const Vidpromise = new Promise((resolve,reject) => {
    video.on('end', function() {
      logger.log(fName + " downloaded.", HIGH);
      resolve();
    });
  });

  let x = await Vidpromise;

  return {title:info.title,file:fName,length:info._duration_raw,start:info.start_time,end:info._duration_raw,played:false};
}

var getVidInfo = async function(url)
{
  const promise = new Promise((resolve,reject) => {
    ytd.getInfo(url,[],function(err,info) {
      if (err) { reject(); }
      resolve(info);
    });
  });

  promise.catch(error => {logger.error("Issue: " + error);})

  let videoInf = await promise;
  return {title:videoInf.title,length:videoInf.duration,start:videoInf.start_time,rawInfo:videoInf};
}

module.exports = {
  downloadFromURL: downloadFromURL,
  getVidInfo: getVidInfo,
}
