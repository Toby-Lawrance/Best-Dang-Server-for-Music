var child = require('child_process');
var logger = require('./logger');
var fs = require('fs');

module.exports.play = async function(videoLoc)
{
  try {
    const vlc = child.spawn('vlc',['-f','--play-and-exit','tmp/'+videoLoc]);

    vlc.on('exit', (code,signal)=> {
      logger.log(videoLoc + " ended",MEDIUM);
      fs.unlink('tmp/'+videoLoc, (err) => {
        if(err) {logger.error("Deletion issue: " + err);}
        logger.log(videoLoc + " has been deleted.",MEDIUM);
      });
    });
  } catch (e) {
    logger.error("Issue playing: " + e);
  }
}
