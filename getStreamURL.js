const https = require("https");

/**
 * Gets Stream URL of Specified Song
 *
 * @param {String} trackID
 * @param {String} clientID
 * @returns {Promise<String>}
 */
async function getStreamURL(trackID, clientID) {
  return new Promise((resolve, reject) => {
    if (!trackID) {
      reject("No Track ID");
    } else if (!clientID) {
      reject("No Client ID");
    } else {
      https
        .get(
          `https://api.soundcloud.com/i1/tracks/${trackID}/streams?client_id=${clientID}`,
          res => {
            res.once("data", d => {
              let url = JSON.parse(d.toString("ascii"))["http_mp3_128_url"];
              if (url) {
                resolve(url);
              } else {
                reject("Invalid Track ID and/or Client ID");
              }
            });
            res.on("error", err => reject(err));
          }
        )
        .on("error", err => reject(err));
    }
  });
}

module.exports = getStreamURL;
