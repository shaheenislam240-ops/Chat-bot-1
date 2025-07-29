const fs = require("fs");
const request = require("request");
const path = require("path");

const videoLinks = [
  "https://i.imgur.com/8tJ70qr.mp4"
];

module.exports.config = {
  name: "abdullah",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Auto reply to 'abdullah' with video",
  commandCategory: "noprefix",
  usages: "abdullah",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": ""
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const message = event.body?.toLowerCase().trim();
  if (!message || !message.includes("abdullah")) return;

  const msg = 
    "╭─────────────⭑─────────────╮\n" +
    "   𝙎𝙝𝙚 𝙞𝙨 𝙧𝙭 ✨\n" +
    "   𝙏𝙖𝙠𝙚 𝙨𝙤𝙗𝙖𝙞 𝘼𝙗𝙙𝙪𝙡𝙡𝙖𝙝 𝙣𝙖𝙢𝙚 𝙖 𝙘𝙝𝙞𝙣𝙚 😎\n" +
    "╰─────────────⭑─────────────╯";

  const videoUrl = videoLinks[Math.floor(Math.random() * videoLinks.length)];
  const filePath = path.join(__dirname, "cache", `${event.senderID}_abdullah.mp4`);

  const file = fs.createWriteStream(filePath);
  request(videoUrl)
    .pipe(file)
    .on("finish", () => {
      api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    })
    .on("error", (err) => {
      console.error("Video download error:", err);
    });
};

module.exports.run = async function () {
  // Nothing here, because this module uses noprefix trigger
};
