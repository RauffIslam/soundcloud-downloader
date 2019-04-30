const https = require("https");

const requestOptions = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Safari/537.36"
  }
};

/**
 * Gets Track ID of Specified Song
 *
 * @param {String} trackURL
 * @returns {Promise<String>}
 */
async function getTrackID(trackURL) {
  return new Promise((resolve, reject) => {
    https
      .get(trackURL, requestOptions, res => {
        res.once("data", d => {
          let regex = /soundcloud:\/\/sounds:(.*?)"/.exec(d.toString("ascii"));
          if (regex !== null) {
            resolve(regex[1]);
          } else {
            reject("Invalid URL");
          }
        });
        res.on("error", err => reject(err));
      })
      .on("error", err => reject(err));
  });
}

module.exports = getTrackID;
