const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "prefixvideo",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send gif/video when only prefix is sent",
  commandCategory: "fun",
  usages: "",
  cooldowns: 0
};

module.exports.run = async function ({ api, event }) {
  try {
    const prefix = global.config.PREFIX || "!"; // Mirai config থেকে prefix নিবে

    // যদি শুধু prefix টাই লেখা হয়
    if ((event.body || "").trim() !== String(prefix)) return;

    // cache ফোল্ডারে আপনার ফাইল রাখবেন (prefix.gif বা prefix.mp4)
    let filePath = path.join(__dirname, "cache", "prefix.gif");
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, "cache", "prefix.mp4");
    }

    if (!fs.existsSync(filePath)) {
      return api.sendMessage(
        `⚠️ Cache ফোল্ডারে prefix.gif বা prefix.mp4 পাওয়া যায়নি!`,
        event.threadID,
        event.messageID
      );
    }

    api.sendMessage(
      {
        body: `👉 My prefix is: ${prefix}`,
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      event.messageID
    );
  } catch (e) {
    console.error(e);
  }
};
