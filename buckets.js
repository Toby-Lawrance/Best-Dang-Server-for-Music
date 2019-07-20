var logger = require('./logger');
var admin = require('./admin');
var player = require('./player');
var downloader = require('./download');
var ffmpeg = require('ffmpeg');
var users = require('./user');

var buckets = [];

var getQueue = function(ip) {
  var user = users.getUser(ip);
  if(!user)
  {
      logger.log("Returning a non personalised Queue",HIGH);
      return buckets;
  }

  var personalisedBuckets = []; //Quick way to clone an array

  for(var i = 0; i < buckets.length; i++)
  {
    var bucket = buckets[i];
    var timeLeft = getTimeLeftInBucket(user,i);
    personalisedBuckets[i] = {timeLeft:timeLeft,songs:bucket};
  }

  logger.log("Returning a personalised queue: " + JSON.stringify(personalisedBuckets),HIGH);

  return personalisedBuckets;
}

var popNextVideo = function() {
  if(buckets.length === 0)
    {return null;}

  for(var i = 0; i < buckets[0].length; i++)
  {
    var song = buckets[0][i];
    if(!song.played)
    {
      song.played = true;
      return song;
    }
  }
  //If all Songs in the bucket are played, then pop the bucket and do the next one via recursion
  buckets.shift();
  return popNextVideo();

}

var getTimeLeftInBucket = function(user,index) {
  if(buckets.length <= index)
  {
    logger.error("Tried to access an inaccessible bucket");
    return;
  }
  var timeLeft = admin.getBucketLength();
  for(var song of buckets[index])
  {
    if(song.user.ip === user.ip)
    {
      timeLeft = timeLeft - song.length;
    }
  }

  if(timeLeft < 0)
  {
    logger.error("Negative time in bucket: " + timeLeft);
  }

  return timeLeft;

}

var addToQueue = function(videoObject,user) {
  try {
    videoObject = videoSanity(videoObject,user);
    logger.log("Attempting to queue: " + JSON.stringify(videoObject),DEV);
    if(buckets.length === 0)
    {
      buckets.push([]);
    }

    for(var i = 0; i < buckets.length; i++)
    {
      var remainingTime = getTimeLeftInBucket(user,i);
      logger.log("Bucket " + i + " has: " + remainingTime + " seconds left and video is: " + videoObject.length + "s long",DEV);
      if(videoObject.length <= remainingTime)
      {
        buckets[i].push(videoObject);
        if(!player.isPlaying() && i === 0 && buckets[i].length === 1 ) //The single song just added
        {
          logger.log("Fresh song is here",DEV);
          player.playSongs(); //Trigger loop when adding a fresh song
        }
        logger.log("Queued song: " + JSON.stringify(videoObject) + " in Bucket: " + i,HIGH);
        return true;
      }
    }

    buckets.push([videoObject]);
    return true;

  } catch (e) {
    logger.error("I probably messed up here: " + e);
    if(videoObject && videoObject.file)
    {
          player.deleteSong(videoObject.file);
    }
    return false;
  }
}

var videoSanity = function(video,user)
{
  if(!video.start)
  {
    video.start = 0;
  }

  if(!video.end)
  {
    video.end = video.length;
  }

  if(video.length > admin.getBucketLength() && ((video.end - video.start) > admin.getBucketLength() || video.end === 0)) //Length refers to raw length here
  {
    video.end = admin.getBucketLength();
  }

  video.length = video.end - video.start; //Length refers to play length here

  if(!video.user)
  {
    logger.log("No user found on video, applying: " + JSON.stringify(user),DEV);
    video.user = user;
  }

  return video;
}

var uploadYTVideo = async function(url,ip,img) {
  try {
    var user = users.getUser(ip);
    var video = await downloader.downloadFromURL(url);
    logger.log("Downloaded video: " + JSON.stringify(video),DEV);
    if(!user)
    {
      throw Error("User not found: " + ip);
    }
    if(!video)
    {
      throw Error("Video not found: " + url);
    }
    video.user = user;

    addToQueue(video,user);
    logger.log("Added video: " + JSON.stringify(video) + " from: " + JSON.stringify(user),LOW);
  } catch (e) {
    logger.error("Error attempting to upload: " + url + " error: " + e);
  }
}

var uploadFileVideo = async function(file,ip,img) {
  var user = users.getUser(ip);
  var video = {title:file,file:file, length: 0, start:0, end:0,played:false};
  var videoeditProm = new ffmpeg(video.file);
  videoeditProm.then(function(videoFile) {
    var meta = videoFile.metadata;
    logger.log("Metadata: " + JSON.stringify(meta),HIGH);
    var duration = meta.duration;
    video.length = duration;
    video.end = duration;
    logger.log("Set duration of video: " + JSON.stringify(video));
  });
  videoeditProm.catch((err) => logger.error("Error when getting video metadata: " + err));

  await videoeditProm;

  logger.log("Added video: " + JSON.stringify(video) + " from: " + JSON.stringify(user),LOW);
  if(!user)
  {
    throw Error("User not found: " + ip);
  }
  video.user = user;
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
