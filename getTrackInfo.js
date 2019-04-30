const https = require("https");

/**
 * Gets Track Info of Specified Song
 *
 * @param {String} trackID
 * @param {String} clientID
 * @returns {Promise<{artist:string, title:string}>}
 */

async function getTrackInfo(trackID, clientID) {
  return new Promise((resolve, reject) => {
    if (!trackID) {
      reject("No Track ID");
    } else if (!clientID) {
      reject("No Client ID");
    } else {
      https
        .get(
          `https://api.soundcloud.com/tracks/${trackID}?client_id=${clientID}`,
          res => {
            res.once("data", d => {
              let data = JSON.parse(d.toString("ascii"));
              if (data) {
                resolve({
                  artist: data.user.username,
                  title: data.title
                });
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

module.exports = getTrackInfo;
