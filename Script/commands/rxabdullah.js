const fs = require("fs");
const request = require("request");

const videoLinks = [
  "https://files.catbox.moe/206yiy.mp4",
  "https://files.catbox.moe/ox1mn0.mov"
];

const usedVideos = new Set();

const keywords = ["abdullah", "rx abdullah", "abdullah vai"];

module.exports.config = {
  name: "rxabdullah",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Trigger video on Abdullah-related keywords",
  commandCategory: "noprefix",
  usages: "",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs": ""
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const body = (event.body || "").toLowerCase();

  if (!keywords.some(keyword => body.includes(keyword))) return;

  const available = videoLinks.filter(v => !usedVideos.has(v));
  if (available.length === 0) usedVideos.clear();

  const selected = available[Math.floor(Math.random() * available.length)];
  usedVideos.add(selected);

  const filePath = __dirname + "/cache/rxvideo.mp4";

  // Ensure 'cache' folder exists
  if (!fs.existsSync(__dirname + "/cache")) {
    fs.mkdirSync(__dirname + "/cache");
  }

  const message = `
╭•┄┅════❁🌺❁════┅┄•╮
     🥺 rX Abdullah... 💔
╰•┄┅════❁🌺❁════┅┄•╯`;

  const callback = () => {
    api.sendMessage({
      body: message,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
  };

  request(encodeURI(selected))
    .pipe(fs.createWriteStream(filePath))
    .on("close", callback);
};

module.exports.run = () => {};
