const fs = require("fs");
const path = require("path");
const axios = require("axios");

let videoList = [
  "https://i.imgur.com/sOLB0bS.mp4",
  "https://i.imgur.com/m9V29Sa.mp4",
  "https://i.imgur.com/d3plZW4.mp4",
  "https://i.imgur.com/Fsn334Q.mp4"
];

let usedVideos = [];

module.exports.config = {
  name: "maria",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Maria likhle random video send kore",
  commandCategory: "fun",
  usages: "maria",
  cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
  try {
    // সব ভিডিও শেষ হয়ে গেলে আবার reset হবে
    if (videoList.length === 0) {
      videoList = usedVideos;
      usedVideos = [];
    }

    // Random video select
    const randomIndex = Math.floor(Math.random() * videoList.length);
    const videoUrl = videoList[randomIndex];

    // used এ নিলাম
    usedVideos.push(videoUrl);
    videoList.splice(randomIndex, 1);

    // cache directory check
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const cachePath = path.join(cacheDir, `maria_${Date.now()}.mp4`);

    // Step 1: Download video into cache file
    const response = await axios.get(videoUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));

    // Step 2: Send video from cache
    api.sendMessage(
      {
        body: "🎬 Here’s Maria!",
        attachment: fs.createReadStream(cachePath),
      },
      event.threadID,
      (err) => {
        // send complete হলে delete করে দেবে
        try { fs.unlinkSync(cachePath); } catch (e) {}
      },
      event.messageID
    );

  } catch (err) {
    api.sendMessage("❌ Cache theke video pathate problem holo!", event.threadID, event.messageID);
    console.error(err);
  }
};
