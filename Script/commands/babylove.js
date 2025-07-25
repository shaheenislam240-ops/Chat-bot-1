const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "babylove",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "RX Abdullah",
  description: "Multi auto voice response on trigger",
  commandCategory: "auto",
  usages: "",
  cooldowns: 0,
  prefix: false
};

// 🔥 Trigger-based setup
const triggers = [
  {
    keywords: ["ghumabo baby"],
    audioUrl: "https://files.catbox.moe/us0nva.mp3",
    reply: "😴 Okaay baby, sweet dreams 🌙",
    fileName: "ghumabo.mp3"
  },
  {
    keywords: ["bhalobashi baby"],
    audioUrl: "https://files.catbox.moe/ga798u.mp3",
    reply: "💖 Aami o bhalobashi tomake baby!",
    fileName: "bhalobashi.mp3"
  }
  // ➕ Add more trigger objects here if needed
];

module.exports.handleEvent = async function({ api, event }) {
  const msg = event.body?.toLowerCase();
  if (!msg) return;

  for (const trigger of triggers) {
    if (trigger.keywords.some(keyword => msg.includes(keyword))) {
      const filePath = path.join(__dirname, trigger.fileName);
      try {
        const res = await axios.get(trigger.audioUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));

        api.sendMessage({
          body: trigger.reply,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      } catch (e) {
        console.log(`❌ Failed to send audio for "${trigger.keywords[0]}":`, e.message);
      }
      break; // Stop after first match
    }
  }
};

module.exports.run = () => {};
