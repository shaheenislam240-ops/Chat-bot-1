const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "catbox18",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX (Catbox Vault)",
  description: "🔞 Catbox 18+ video vault with auto unsend & random video",
  commandCategory: "admin",
  usages: "[exact keyword]",
  cooldowns: 3,
  prefix: false
};

const allowedAdmins = ["100068565380737", "61554657546543"];

const keywordDB = {
  "pron video": [
    "https://files.catbox.moe/abcd1234.mp4"
  ],
  "xxx": [
    "https://files.catbox.moe/file1.mp4",
    "https://files.catbox.moe/file2.mp4"
  ],
  "sex video": [
    "https://files.catbox.moe/file3.mp4"
  ]
};

function getRandomVideo(videos) {
  return videos[Math.floor(Math.random() * videos.length)];
}

module.exports.handleEvent = async function ({ api, event }) {
  const { body, senderID, threadID, messageID } = event;
  if (!body) return;

  const messageText = body.toLowerCase().trim();
  if (!keywordDB.hasOwnProperty(messageText)) return;

  if (!allowedAdmins.includes(senderID)) {
    return api.sendMessage("⚠️ Only rX Abdullah can authorize this command.", threadID, messageID);
  }

  const videos = keywordDB[messageText];
  const videoURL = getRandomVideo(videos);

  const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);

  try {
    const response = await axios.get(videoURL, { responseType: "stream" });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `🔞 Here's your secure video: "${messageText}"\n⏳ Auto-delete in 2 minutes.`,
        attachment: fs.createReadStream(filePath)
      }, threadID, (err, info) => {
        if (err) return;
        setTimeout(() => api.unsendMessage(info.messageID), 2 * 60 * 1000);
        setTimeout(() => fs.unlinkSync(filePath), 2 * 60 * 1000 + 5000);
      }, messageID);
    });

    writer.on("error", () => {
      api.sendMessage("❌ Error writing the video file.", threadID, messageID);
    });
  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Failed to fetch the secure video.", threadID, messageID);
  }
};

module.exports.run = () => {};
