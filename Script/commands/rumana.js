const fs = require("fs");
const request = require("request");
const path = require("path");

module.exports.config = {
  name: "rumana",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send Rumana video with fixed title",
  commandCategory: "noprefix",
  usages: "rumana",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": ""
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const content = event.body ? event.body.toLowerCase() : "";

  if (content.startsWith("rumana")) {
    const videoUrl = "https://i.imgur.com/FcSfdXb.mp4";
    const filePath = path.join(__dirname, "cache", "rumana.mp4");

    const fixedTitle = "🔥 Why u call Rumana? Watch this video! 🔥";

    const sendVideo = () => {
      api.sendMessage({
        body: fixedTitle,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
      }, event.messageID);
    };

    if (fs.existsSync(filePath)) {
      // If file already downloaded, send it directly
      sendVideo();
    } else {
      // Download then send
      const stream = request(videoUrl);
      stream.pipe(fs.createWriteStream(filePath)).on("close", sendVideo);
    }
  }
};

module.exports.run = async () => {};
