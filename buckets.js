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

var getTimeLeftInBucket = function(user,index) {
  if(buckets.length <= index)
  {
    logger.error("Tried to access an inaccessible bucket");
    return;
  }
  var timeLeft = admin.getBucketLength();
  for(var song in buckets[index])
  {
    if(song.user.ip === user.ip)
    {
      timeLeft = timeLeft - song.end;
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
    videoObject = videoSanity(videoObject);

    if(buckets.length === 0)
    {
      logger.log("Strong suspicion this shouldn't actually ever happen unless someone is very fast",HIGH);
      buckets.push([videoObject]);
      return true;
    }

    for(var i = 0; i < buckets.length; i++)
    {
      var remainingTime = getTimeLeftInBucket(user,i);
      if(videoObject.length <= remainingTime)
      {
        buckets[i].push(videoObject);
        if(!player.isPlaying() && i === 0 && buckets[i].length === 1 ) //The single song just added
        {
          logger.log("Fresh song is here",DEV);
          player.playSongs(); //Trigger loop when adding a fresh song
        }
      }

      logger.log("Queued song: " + JSON.stringify(videoObject) + " in Bucket: " + i);
      return true;
    }

    buckets.push([videoObject]);
    return true;

  } catch (e) {
    logger.error("I probably messed up here: " + e);
    return false;
  }
}

var videoSanity = function(video)
{
  if(video.start === null)
  {
    video.start = 0;
  }

  if(video.length > admin.getBucketLength() && (video.end > admin.getBucketLength() || video.end === 0)) //Length refers to raw length here
  {
    video.end = admin.getBucketLength();
  }

  video.length = video.end - video.start; //Length refers to play length here

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
