const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "chipa",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Chipa detect kore video send",
  commandCategory: "fun",
  usages: "",
  cooldowns: 0,
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID } = event;
  if (!body) return;

  // keyword check
  const keyword = body.toLowerCase();
  if (keyword.includes("chipa") || keyword.includes("চিপা")) {
    try {
      const cachePath = path.join(__dirname, "cache", "chipa.mp4");

      // jodi file already cache a thake → just send
      if (!fs.existsSync(cachePath)) {
        const url = "https://i.imgur.com/HJ6aHfC.mp4";
        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.ensureDirSync(path.join(__dirname, "cache"));
        fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));
      }

      // send from cache
      api.sendMessage(
        {
          body: "sobai chipa theke ber how",
          attachment: fs.createReadStream(cachePath),
        },
        threadID
      );
    } catch (e) {
      api.sendMessage("❌ Error: video pathano gelo na", threadID);
      console.log(e);
    }
  }
};

module.exports.run = async function () {};
