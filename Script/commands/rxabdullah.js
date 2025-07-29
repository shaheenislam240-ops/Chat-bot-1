const fs = require("fs");
const request = require("request");

const videoLinks = [
  "https://files.catbox.moe/206yiy.mp4",
  "https://files.catbox.moe/ox1mn0.mov"
];

const usedVideos = new Set();

const keywords = ["abdullahr", "rx abdullah", "abdullah"];

module.exports.config = {
  name: "rxabdullah",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Trigger video on Abdullah-related keywords",
  commandCategory: "noprefix",
  usages: "abdullah",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event }) => {
  const body = event.body?.toLowerCase() || "";

  if (!keywords.some(keyword => body.includes(keyword))) return;

  // Get a random video that hasn't been used yet
  const availableVideos = videoLinks.filter(link => !usedVideos.has(link));
  if (availableVideos.length === 0) usedVideos.clear(); // Reset if all used

  const selected = availableVideos[Math.floor(Math.random() * availableVideos.length)];
  usedVideos.add(selected);

  const filePath = __dirname + "/cache/rxvideo.mp4";

  // Aura-style title message
  const auraMessage = `
╭•┄┅════❁🌺❁════┅┄•╮
     🥺 rX Abdullah... 💔
╰•┄┅════❁🌺❁════┅┄•╯`;

  const callback = () => {
    api.sendMessage({
      body: auraMessage,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
  };

  request(encodeURI(selected))
    .pipe(fs.createWriteStream(filePath))
    .on("close", callback);
};

module.exports.run = () => {};
