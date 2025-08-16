const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "prefixvideo",
  eventType: ["message"],
  version: "1.0.0",
  credits: "rX Abdullah",
  description: "Send gif/video when only prefix is sent"
};

module.exports.run = async function({ api, event }) {
  try {
    const prefix = global.config.PREFIX || "!"; // Mirai config থেকে prefix নিবে
    const body = (event.body || "").trim();

    // শুধু prefix লিখলে কাজ করবে
    if (body !== prefix) return;

    // cache ফোল্ডারে ফাইল খুঁজবে
    let filePath = path.join(__dirname, "../commands/cache/prefix.gif");
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, "../commands/cache/prefix.mp4");
    }

    if (!fs.existsSync(filePath)) {
      return api.sendMessage(
        `⚠️ cache ফোল্ডারে prefix.gif বা prefix.mp4 পাওয়া যায়নি!`,
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
    console.log("Prefixvideo error:", e);
  }
};
