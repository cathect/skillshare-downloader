const config = require('./config');
const fs = require('fs');
const request = require('request');
const logger = require('./logger');
const progressBar = require('progress');

const course = config.courseUrl;
const dlDir = config.downloadDir;
const baseUrl = config.skillUrl;
const cookie = request.cookie(config.sessionCookie);

exports.getBaseInfo = function() {
  return new Promise(function(resolve, reject) {
    var headers = {
      'Content-Type': 'application/json',
      'Cookie': cookie
    };

    var options = {
      url: course,
      method: 'GET',
      headers: headers
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var formatted = JSON.parse(body.toString().match(/SS\.serverBootstrap = (.+);\n/)[1]);
        var fullBody = body;
        resolve([
          formatted,
          fullBody
        ])
      } else {
        reject(JSON.stringify(error));
      };
    })
  }).catch(err => console.log(err));
};


exports.getPolicyKey = function(baseInfo) {
  return new Promise(function(resolve, reject) {
    var url = JSON.stringify(baseInfo).match(/https:\/\/static.skillshare.com\/assets\/js\/brightcove\/+[^"]*/)
    var headers = {
      'Content-Type': 'application/json',
      'Cookie': cookie
    };

    var options = {
      url: url.toString().slice(0, -1),
      method: 'GET',
      headers: headers
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var pk = body.toString().match(/policyKey:"([^"]*)/)
        resolve(pk[1])
      } else {
        reject(JSON.stringify(error));
      };
    });
  }).catch(err => console.log(err));
};

exports.getVideoInfo = function(accID, pk, sess) {
  return new Promise(function(resolve, reject) {
    const match = sess.video_mid_thumbnail_url.match(/\/thumbnails\/(\d+)\//);
    if (!match && !sess.videoId) {
      console.log("No Video ID for ", sess);
      resolve(null);
    }
    const videoId = match ? match[1] : sess.videoId.split(":")[1];
    const url = `https://edge.api.brightcove.com/playback/v1/accounts/${accID}/videos/${videoId}`;

    var headers = {
      'Content-Type': 'application/json',
      'Cookie': cookie,
      'Accept': "application/json;pk=" + pk
    };

    var options = {
      url: url,
      method: 'GET',
      headers: headers,
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve(JSON.parse(body))
      } else {
        reject(JSON.stringify(error));
      };
    })
  }).catch(err => console.log(err));;
};

exports.download = function(file_url, targetPath) {
  return new Promise(function(resolve, reject) {
    var req = request({
      method: 'GET',
      uri: file_url
    });

    var out = fs.createWriteStream(targetPath);
    req.pipe(out);

    req.on('response', function(data) {
      var len = parseInt(data.headers['content-length'], 10);
      console.log();
      var bar = new progressBar('Downloading: [:bar] :rate/bps :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: len
      });
      req.on('data', function(chunk) {
        bar.tick(chunk.length);
      });
      req.on('end', function() {
        resolve()
      });
    });
  });
}


process.on("unhandledRejection", err => {
  console.error("Uncaught Promise Error: \n" + err.stack);
});
