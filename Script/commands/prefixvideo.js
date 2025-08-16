const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "prefixvideo",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send a gif/video when only prefix is typed",
  commandCategory: "fun",
  usages: "",
  cooldowns: 0
};

module.exports.run = async function ({ api, event, global }) {
  try {
    // config থেকে prefix detect
    const prefix =
      (global?.GoatBot?.config?.prefix) ??
      (global?.config?.PREFIX) ??
      "!";

    // শুধু prefix টাইপ হলে trigger করবে
    if ((event.body || "").trim() !== String(prefix)) return;

    // cache ফোল্ডারে আপনার ভিডিও/gif ফাইল রাখবেন
    const filePath = path.join(__dirname, "cache", "prefix.gif"); 
    // 👉 এখানে আপনি "prefix.mp4" বা "prefix.gif" যেটা দিতে চান সেটা রাখবেন

    if (!fs.existsSync(filePath)) {
      return api.sendMessage(
        `⚠️ unknown error`,
        event.threadID,
        event.messageID
      );
    }

    api.sendMessage(
      {
        body: `My prefix is: ${prefix}`,
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      event.messageID
    );
  } catch (e) {
    console.error(e);
  }
};
