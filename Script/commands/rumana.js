const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "rumana",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Download from imgur and send",
  commandCategory: "auto-response",
  usages: "",
  cooldowns: 2,
};

module.exports.handleEvent = async function ({ api, event }) {
  const message = event.body?.toLowerCase();
  if (!message || !message.includes("rumana")) return;

  const videoUrl = "https://i.imgur.com/FcSfdXb.mp4";
  const filePath = path.join(__dirname, "rumana_temp.mp4");

  try {
    // Download video to local file
    const response = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Wait until download finishes
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Send video from local file
    api.sendMessage({
      body: "🔥 Here's your Rumana video (local downloaded)!",
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => {
      // Delete temp file after send
      fs.unlinkSync(filePath);
    }, event.messageID);

  } catch (err) {
    console.error("❌ Error downloading or sending Rumana video:", err);
    api.sendMessage("❌ Rumana video pathaite somossa hoise.", event.threadID, event.messageID);
  }
};

module.exports.run = () => {};
