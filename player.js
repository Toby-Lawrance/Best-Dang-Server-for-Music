var child = require('child_process');
var logger = require('./logger');
var fs = require('fs');
var buckets = require('./buckets');

var playing = false;

module.exports.isPlaying = function()
{
  return playing;
}

var play = async function(videoLoc)
{
  try {
    playing = true;
    const vlc = child.spawn('vlc',['-f','--play-and-exit','tmp/'+videoLoc]);

    return vlc;

  } catch (e) {
    logger.error("Issue playing: " + e);
  }
}

module.exports.playSongs = async function()
{
  logger.log("Loop started",HIGH);
  while(!buckets.isEmpty())
  {
    var video = buckets.getNextVideo();
    if(!video)
    {
      logger.log("Did not get a video from the buckets",HIGH);
      return;
    }

    logger.log("Playing: " + video.title,LOW);

    var vlc = await play(video.file);

    var promise = new Promise((resolve,reject) => {
      if(false){reject();}
      vlc.on('exit', (code,signal)=> {
        var fName = video.file;
        deleteSong(fName);
        resolve();
      });
    });

    await promise;
    logger.log(video.title + " ended",MEDIUM);
    playing = false;
  }
}

module.exports.play = play;

var deleteSong = function(file)
{
  fs.unlink('tmp/'+file, (err) => {
    if(err) {logger.error("Deletion issue: " + err);}
    logger.log(file + " has been deleted.",MEDIUM);
  });
}

module.exports.deleteSong = deleteSong;
