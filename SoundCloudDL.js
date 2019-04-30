const https = require("https");
const fs = require("fs");
const NodeID3 = require("node-id3");

const clientID = process.argv[3];
const trackURL = process.argv[2];

const getTrackID = require("./getTrackID");
const getTrackInfo = require("./getTrackInfo");
const getStreamURL = require("./getStreamURL");

async function download() {
  const trackID = await getTrackID(trackURL);
  console.log("Retrived Track ID");
  const trackInfo = await getTrackInfo(trackID, clientID);
  console.log("Retrived Track Info");
  const streamURL = await getStreamURL(trackID, clientID);
  console.log("Retrived Stream URL");
  const filePath = `./download/${trackInfo.title}.mp3`;
  const file = fs.createWriteStream(filePath);
  console.log(`Created File: ${trackInfo.title}.mp3`);
  await https
    .get(streamURL, async res => {
      await res.pipe(file);
      console.log(`Wrote Content to ${trackInfo.title}.mp3`);
      await NodeID3.write(
        {
          title: trackInfo.title,
          artist: trackInfo.artist
        },
        filePath
      );
      console.log(`Wrote ID3 Tags to ${trackInfo.title}.mp3`);
      file.on("finish", () => {
        file.close();
      });
    })
    .on("error", err => {
      fs.unlink(filePath, err => console.log(err));
      console.log(err);
    });
}

download();
