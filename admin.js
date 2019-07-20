var fs = require('fs');
var jsonfile = require('jsonfile');
const conffile = 'config.json';
var config = jsonfile.readFileSync(conffile, function (err,obj) {
  if(err) console.error(err);
});

module.exports = {
  getConfig: function() {
    return config;
  },

  getPort : function () {
    return config.Port;
  },

  getBucketLength: function() {
    return config.bucketLength;
  }

}
