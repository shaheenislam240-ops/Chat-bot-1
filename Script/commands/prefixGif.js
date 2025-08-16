const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "prefixgif", // command name, Mirai তে লাগবে
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send GIF when someone types !",
  commandCategory: "fun",
  usages: "",
  cooldowns: 0,
  usePrefix: false // false মানে Mirai prefix check করবে না, event নয় command
};

module.exports.run = async function({ api, event }) {
  try {
    const body = (event.body || "").trim();

    // শুধু '!' হলে trigger হবে
    if (body !== "!") return;

    // cache ফোল্ডারের GIF ফাইল
    const filePath = path.join(__dirname, "cache", "prefix.gif"); 
    if (!fs.existsSync(filePath)) return;

    api.sendMessage(
      {
        body: "🎉 Here's your GIF!",
        attachment: fs.createReadStream(filePath)
      },
      event.threadID
    );
  } catch (e) {
    console.log("prefixGif error:", e);
  }
};
