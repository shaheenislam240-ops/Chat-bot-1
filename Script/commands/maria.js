const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "maria",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Maria likhle cache theke random gif send kore",
  commandCategory: "fun",
  usages: "maria",
  cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
  try {
    const cacheDir = path.join(__dirname, "cache");

    // cache folder er moddhe file list
    const gifList = ["m1.gif", "m2.gif", "m3.gif", "m4.gif", "m5.gif"];
    
    // random file select
    const randomGif = gifList[Math.floor(Math.random() * gifList.length)];
    const gifPath = path.join(cacheDir, randomGif);

    if (!fs.existsSync(gifPath)) {
      return api.sendMessage(`❌ ${randomGif} cache folder e paoa jay nai!`, event.threadID, event.messageID);
    }

    // send gif
    api.sendMessage(
      {
        body: "🎬 Here’s Maria!",
        attachment: fs.createReadStream(gifPath),
      },
      event.threadID,
      event.messageID
    );

  } catch (err) {
    api.sendMessage("❌ Cache theke gif pathate problem holo!", event.threadID, event.messageID);
    console.error(err);
  }
};
