const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

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

const VIDEO_URL = "https://i.imgur.com/FcSfdXb.mp4";
const FILE_PATH = path.join(__dirname, "cache", "rumana.mp4");

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const { body, threadID, messageID } = event;
    if (!body || body.toLowerCase() !== "rumana") return;

    // Check & download video if not exists
    if (!fs.existsSync(FILE_PATH)) {
      const res = await axios.get(VIDEO_URL, { responseType: "stream" });
      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(FILE_PATH);
        res.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }

    // Send video with title
    return api.sendMessage({
      body: "😐 কেন ডাকো আমাকে 'রুমানা' বলে?",
      attachment: fs.createReadStream(FILE_PATH)
    }, threadID, messageID);

  } catch (err) {
    console.error("Rumana module error:", err);
    return api.sendMessage("❌ Rumana ভিডিও পাঠাতে সমস্যা হয়েছে।", event.threadID);
  }
};
