const api = require('./api');
const config = require('./config');
const logger = require('./logger');
const path = require("path");
const fs = require('fs');

function cleanName(name) {
  return name.toString().replace(/[^a-z0-9]+/gi, " ").trim();
}

var formatted = null;
var videoInfos = [];

api.getBaseInfo().then(info => {
  formatted = info[0];
  return api.getPolicyKey(info[1])
}).then(policyKey => {
  var brightcoveAccountId = formatted.pageData.videoPlayerData.brightcoveAccountId
  var sessions = formatted.pageData.videoPlayerData.units[0].sessions
  populateVideoInfos(brightcoveAccountId, policyKey, sessions);
})

async function populateVideoInfos(accID, pk, sess) {
  var videosProcessed = 0;
  for (var i = 0; i < sess.length; i++) {
    await api.getVideoInfo(accID, pk, sess[i]).then(res => {
      videoInfos.push(res);
      videosProcessed++;
      if (videosProcessed === sess.length) {
        recursiveDownload();
      }
    })
  }
}

async function recursiveDownload() {
  var sessions = formatted.pageData.videoPlayerData.units[0].sessions
  var classTitle = formatted.pageData.videoPlayerData.shareLinks.classTitle
  const folderName = path.resolve(config.downloadDir, cleanName(classTitle));
  if (!fs.existsSync(folderName)) fs.mkdirSync(folderName);
  logger.info(`SAVING TO: ${folderName}`)
  for (var i = 0; i < sessions.length; i++) {
    const filename = path.join(
      folderName,
      sessions[i].rank + 1 + " - " + cleanName(sessions[i].title) + ".mp4"
    );
    var videoUrl = videoInfos[i].sources
      .filter(
        source =>
        (source.src || "").startsWith("https") && source.container === "MP4"
      )
      .sort((a, b) => b.avg_bitrate - a.avg_bitrate)[0].src;
    await api.download(videoUrl, filename);
    console.log(`Saved video '${filename}'`);
  }
}
