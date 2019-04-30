const https = require("https");
const fs = require("fs");
const NodeID3 = require("node-id3");

const CLIENT_ID = process.argv[3];
const TRACK_URL = process.argv[2];

/**
 * Gets Track ID of Specified Song
 *
 * @param {String} URL
 * @returns {Promise<String>}
 */
async function getTrackID(URL) {
  return new Promise((resolve, reject) => {
    https
      .get(
        URL,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Safari/537.36"
          }
        },
        res => {
          res.once("data", d => {
            let regex = /soundcloud:\/\/sounds:(.*?)"/.exec(
              d.toString("ascii")
            );
            if (regex !== null) {
              resolve(regex[1]);
            } else {
              reject("Invalid URL");
            }
          });
          res.on("error", err => reject(err));
        }
      )
      .on("error", err => reject(err));
  });
}

/**
 * Gets Track Info of Specified Song
 *
 * @param {String} TRACK_ID
 * @param {String} CLIENT_ID
 * @returns {Promise<{artist:string, title:string}>}
 */

async function getTrackInfo(TRACK_ID, CLIENT_ID) {
  return new Promise((resolve, reject) => {
    if (!TRACK_ID) {
      reject("No Track ID");
    } else if (!CLIENT_ID) {
      reject("No Client ID");
    } else {
      https
        .get(
          `https://api.soundcloud.com/tracks/${TRACK_ID}?client_id=${CLIENT_ID}`,
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

/**
 * Gets Stream URL of Specified Song
 *
 * @param {String} TRACK_ID
 * @param {String} CLIENT_ID
 * @returns {Promise<String>}
 */
async function getStreamURL(TRACK_ID, CLIENT_ID) {
  return new Promise((resolve, reject) => {
    if (!TRACK_ID) {
      reject("No Track ID");
    } else if (!CLIENT_ID) {
      reject("No Client ID");
    } else {
      https
        .get(
          `https://api.soundcloud.com/i1/tracks/${TRACK_ID}/streams?client_id=${CLIENT_ID}`,
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

async function download() {
  const TRACK_ID = await getTrackID(TRACK_URL);
  console.log("Retrived Track ID");
  const TRACK_INFO = await getTrackInfo(TRACK_ID, CLIENT_ID);
  console.log("Retrived Track Info");
  const STREAM_URL = await getStreamURL(TRACK_ID, CLIENT_ID);
  console.log("Retrived Stream URL");
  const FILEPATH = `./download/${TRACK_INFO.title}.mp3`;
  const FILE = fs.createWriteStream(FILEPATH);
  console.log(`Created File: ${TRACK_INFO.title}.mp3`);
  await https
    .get(STREAM_URL, async res => {
      await res.pipe(FILE);
      console.log(`Wrote Content to ${TRACK_INFO.title}.mp3`);
      await NodeID3.write(
        {
          title: TRACK_INFO.title,
          artist: TRACK_INFO.artist
        },
        FILEPATH
      );
      console.log(`Wrote ID3 Tags to ${TRACK_INFO.title}.mp3`);
      FILE.on("finish", () => {
        FILE.close();
      });
    })
    .on("error", err => {
      fs.unlink(FILEPATH, err => console.log(err));
      console.log(err);
    });
}

download();
