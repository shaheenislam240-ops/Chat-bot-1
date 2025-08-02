const axios = require("axios");

module.exports.config = {
  name: "eyeroll",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Sends audio only if message is exactly 🙄🙄",
  commandCategory: "fun",
  usages: "🙄🙄",
  cooldowns: 1
};

module.exports.run = async function ({ api, event }) {
  const input = event.body?.trim();
  const strictEmoji = "🙄🙄";

  if (input !== strictEmoji) return;

  const audioUrl = "https://files.catbox.moe/vgzkeu.mp3";
  const replyMessage = "ki dekhis? 🙄🙄";

  try {
    const response = await axios.get(audioUrl, {
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    return api.sendMessage({
      body: replyMessage,
      attachment: response.data
    }, event.threadID, null, event.messageID);

  } catch (err) {
    console.error("Audio download failed:", err.message);
    return api.sendMessage("⛔ Voice file load korte problem hoise.", event.threadID);
  }
};
