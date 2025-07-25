const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "babylove",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "RX Abdullah",
  description: "Multi auto voice response on trigger",
  commandCategory: "auto",
  usages: "",
  cooldowns: 0,
  prefix: false
};

const triggers = [
  {
    keywords: ["ghumabo"],
    audioUrl: "https://files.catbox.moe/us0nva.mp3",
    reply: "😴 Okaay baby, sweet dreams 🌙",
    fileName: "ghumabo.mp3"
  },
  {
    keywords: ["ringtone"],
    audioUrl: "https://files.catbox.moe/ga798u.mp3",
    reply: "💖ay lo. Baby!",
    fileName: "bhalobashi.mp3"
  },
  {
    keywords: ["ekta gan bolo"],
    audioUrl: "https://files.catbox.moe/rhuifn.mp3",
    reply: "🎶 Suno baby, ei gan ta tomar jonno 💖",
    fileName: "gan.mp3"
  },
  {
    keywords: ["baby explain me"],
    audioUrl: "https://files.catbox.moe/ijgma4.mp3",
    reply: "📝 go away!",
    fileName: "explain.mp3"
  }
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
      break;
    }
  }
};

module.exports.run = () => {};
