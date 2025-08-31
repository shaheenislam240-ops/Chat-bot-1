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
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Maria likhle random video send kore",
  commandCategory: "fun",
  usages: "maria",
  cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
  try {
    // সব ভিডিও শেষ হয়ে গেলে reset হবে
    if (videoList.length === 0) {
      videoList = usedVideos;
      usedVideos = [];
    }

    // Random video select
    const randomIndex = Math.floor(Math.random() * videoList.length);
    const videoUrl = videoList[randomIndex];

    // move to used
    usedVideos.push(videoUrl);
    videoList.splice(randomIndex, 1);

    const cacheDir = path.join(__dirname, "cache");
    const cachePath = path.join(cacheDir, "maria.mp4");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // Download video
    const response = await axios.get(videoUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));

    // Send video
    api.sendMessage(
      {
        body: "🎬 Here’s Maria!",
        attachment: fs.createReadStream(cachePath),
      },
      event.threadID,
      event.messageID
    );
  } catch (err) {
    api.sendMessage("❌ Video pathate somossa holo!", event.threadID, event.messageID);
    console.error(err);
  }
};
