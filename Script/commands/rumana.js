const axios = require("axios");
const fs = require("fs");
const path = require("path");

const VIDEO_URL = "https://i.imgur.com/FcSfdXb.mp4";
const FILE_PATH = path.join(__dirname, "cache", "rumana.mp4");

module.exports.config = {
  name: "rumana",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send Rumana video on trigger",
  commandCategory: "auto",
  usages: "",
  cooldowns: 0,
  prefix: false
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const trigger = event.body?.toLowerCase();
    if (trigger !== "rumana") return;

    // Check if file exists
    if (!fs.existsSync(FILE_PATH)) {
      const res = await axios.get(VIDEO_URL, { responseType: "stream" });
      const writer = fs.createWriteStream(FILE_PATH);
      res.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }

    const message = {
      body: "🙄 কেন ডাকো আমাকে 'রুমানা' বলে?",
      attachment: fs.createReadStream(FILE_PATH)
    };

    return api.sendMessage(message, event.threadID, event.messageID);

  } catch (err) {
    console.error("❌ Rumana module error:", err);
    return api.sendMessage("❌ Rumana video পাঠাতে সমস্যা হয়েছে।", event.threadID);
  }
};
