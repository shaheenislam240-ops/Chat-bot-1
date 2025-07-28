const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "secure18",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "rX (rX Vault System)",
  description: "🔞 Exact-match admin-only 18+ vault with auto unsend",
  commandCategory: "admin",
  usages: "[exact keyword only]",
  cooldowns: 3,
  prefix: false
};

const allowedAdmins = ["100068565380737", "61554657546543"];

const keywordDB = {
  "mia khalifa video": "https://pixeldrain.com/api/file/xyz123",
  "deshi collection": "https://pixeldrain.com/api/file/abc456",
  "bd desi video": "https://pixeldrain.com/api/file/def789"
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, senderID, threadID, messageID } = event;

  if (!body) return;

  const messageText = body.toLowerCase().trim();

  if (!Object.keys(keywordDB).includes(messageText)) return;

  if (!allowedAdmins.includes(senderID)) {
    return api.sendMessage("⚠️ Only rX Abdullah can authorize this command.", threadID, messageID);
  }

  const videoURL = keywordDB[messageText];
  const filename = `${Date.now()}.mp4`;
  const filePath = path.join(__dirname, "cache", filename);

  try {
    const response = await axios({
      method: "GET",
      url: videoURL,
      responseType: "stream"
    });

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
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to fetch the secure video.", threadID, messageID);
  }
};

module.exports.run = () => {};
