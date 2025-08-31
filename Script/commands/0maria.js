const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "maria", // internal command name
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send a random gif when someone types 'Maria' without prefix",
  commandCategory: "fun",
  usages: "Maria",
  cooldowns: 5,
  usePrefix: false // ⭐ prefix lagbe na
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  // যদি message-এ "Maria" থাকে
  if (body.toLowerCase().includes("maria")) {
    const cacheDir = path.join(__dirname, "cache"); // gif folder
    const gifList = ["m1.gif", "m2.gif", "m3.gif", "m4.gif", "m5.gif"];
    const randomGif = gifList[Math.floor(Math.random() * gifList.length)];
    const gifPath = path.join(cacheDir, randomGif);

    if (!fs.existsSync(gifPath)) {
      return api.sendMessage(`❌ ${randomGif} cache folder e paoa jay nai!`, threadID, messageID);
    }

    return api.sendMessage(
      {
        body: "𝐌𝐚𝐫𝐢𝐚 ᰔ☯︎",
        attachment: fs.createReadStream(gifPath)
      },
      threadID,
      messageID
    );
  }
};

module.exports.run = async () => {}; // run function placeholder
