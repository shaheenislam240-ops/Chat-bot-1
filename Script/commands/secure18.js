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

// ✅ Only these users can access full commands
const allowedAdmins = ["100068565380737", "61554657546543"];

// 🔐 Secure video vault with exact match
const keywordDB = {
  "mia khalifa video": "https://pixeldrain.com/api/file/xyz123",
  "deshi collection": "https://pixeldrain.com/u/VH3tMhyz",
  "bd desi video": "https://pixeldrain.com/u/v8ojuLRU"
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, senderID, threadID, messageID } = event;

  if (!body) return;

  const messageText = body.toLowerCase().trim();

  // ✅ Exact keyword match check only
  if (!Object.keys(keywordDB).includes(messageText)) return;

  // 🛡️ Not admin?
  if (!allowedAdmins.includes(senderID)) {
    return api.sendMessage("⚠️ Only rX Abdullah can authorize this command.", threadID, messageID);
  }

  // ✅ Admin matched, send video
  const videoURL = keywordDB[messageText];
  try {
    const res = await axios.get(videoURL, { responseType: "arraybuffer" });
    const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);
    fs.writeFileSync(filePath, Buffer.from(res.data, "utf-8"));

    return api.sendMessage({
      body: `🔞 Here's your secure video: "${messageText}"\n⏳ This will be deleted after 2 minutes.`,
      attachment: fs.createReadStream(filePath)
    }, threadID, (err, info) => {
      fs.unlinkSync(filePath);
      if (err) return;

      setTimeout(() => api.unsendMessage(info.messageID), 2 * 60 * 1000);
    }, messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to fetch the secure video.", threadID, messageID);
  }
};

// 🔇 Run is empty since this isn't a typed command
module.exports.run = () => {};
