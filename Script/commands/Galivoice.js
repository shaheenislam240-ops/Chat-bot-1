const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "Galivoice",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "RX Abdullah + Maria",
  description: "Responds with voice to offensive words",
  commandCategory: "auto",
  usages: "",
  cooldowns: 0,
  prefix: false
};

const trigger = {
  keywords: ["khanki", "magi", "mgi", "khanki"],
  audioUrl: "n.uguu.se/HhLGajXw.mp3",
  reply: "😡 Ei rokom kotha bhalo lage na!",
  fileName: "gali_voice.mp3"
};

module.exports.handleEvent = async function ({ api, event }) {
  const msg = event.body?.toLowerCase();
  if (!msg) return;

  if (trigger.keywords.some(k => msg.includes(k))) {
    const filePath = path.join(__dirname, trigger.fileName);

    try {
      const res = await axios.get(trigger.audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));

      api.sendMessage({
        body: trigger.reply,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, (err, info) => {
        fs.unlinkSync(filePath);
        if (!err) {
          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 2 * 60 * 1000); // 2 minutes
        }
      }, event.messageID);
    } catch (e) {
      console.error("❌ Failed to send gali voice:", e.message);
    }
  }
};

module.exports.run = () => {};
