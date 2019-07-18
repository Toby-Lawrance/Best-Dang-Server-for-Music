var logger = require('./logger');
var admin = require('./admin');
var player = require('./player');
var downloader = require('./download');
var ffmpeg = require('ffmpeg');
var users = require('./user');

var buckets = [];

var getQueue = function() {
  return buckets;
}

var popNextVideo = function() {
  if(buckets.length === 0)
    {return null;}
  if(buckets[0].length === 0)
    {
      buckets.shift();
      return popNextVideo();
    }
  return buckets[0].shift();
}

var addToQueue = function(videoObject,user) {
  try {
    if(buckets.length === 0)
    {
      logger.log("Strong suspicion this shouldn't actually ever be true unless someone is very fast",HIGH);
      buckets.push([videoObject]);
      return true;
    }
    for(var i = 0; i < buckets.length; i++)
    {
      if(buckets[i].length < 10) //Temporary until Users added
      {
          buckets[i].push(videoObject);
          if(!player.isPlaying() && i === 0 && buckets[i].length === 1 ) //The single song just added
          {
            logger.log("Fresh song is actually here",DEV);
            player.playSongs(); //Trigger loop when adding a fresh song
          }
          return true;
      }
    }

    buckets.push([videoObject]);
    return true;
  } catch (e) {
    logger.error("I probably messed up here: " + e);
    return false;
  }
}

var uploadYTVideo = async function(url,ip,img) {
  try {
    var user = users.getUser(ip);
    var video = await downloader.downloadFromURL(url);
    logger.log("Added video: " + JSON.stringify(video) + " from: " + JSON.stringify(user),LOW);
    if(!user)
    {
      throw Error("User not found: " + ip);
    }
    if(!video)
    {
      throw Error("Video not found: " + url);
    }
    addToQueue(video,user);
  } catch (e) {
    logger.error("Error attempting to upload: " + url + " error: " + e);
  }
}

var uploadFileVideo = async function(file,ip,img) {
  var user = users.getUser(ip);
  var video = {title:file,file:file, length: null, start:0 };
  logger.log("Added video: " + JSON.stringify(video) + " from: " + JSON.stringify(user),LOW);
  if(!user)
  {
    throw Error("User not found: " + ip);
  }
  addToQueue(video,user);
}

var isEmpty = function()
{
  if(buckets.length === 0)
  {
    logger.log("No videos to play",MEDIUM);
    return true;
  }
  return false;
}

module.exports = {
  getNextVideo: popNextVideo,
  addToQueue: addToQueue,
  getQueue: getQueue,
  uploadYTVideo: uploadYTVideo,
  uploadFileVideo: uploadFileVideo,
  isEmpty: isEmpty
}
