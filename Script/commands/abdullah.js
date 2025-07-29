const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "abdullah",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send stylish message + Imgur video if someone says 'abdullah'",
  commandCategory: "media",
  usages: "noprefix",
  cooldowns: 3
};

module.exports.handleEvent = async function ({ api, event }) {
  const message = event.body?.toLowerCase();
  if (!message || !message.includes("abdullah")) return;

  const videoUrl = "https://i.imgur.com/8tJ70qr.mp4";
  const filePath = path.join(__dirname, "cache", "abdullah.mp4");

  const styledText = `★彡🌙⛧∘₊˚⋆ 𝑨𝑩𝑫𝑼𝑳𝑳𝑨𝐇 𝑴𝑶𝑫𝑬 ∘₊˚⋆⛧🌙彡★

⚡ ᴘᴏᴡᴇʀ ʟᴇᴠᴇʟ: 9999%

｡･ﾟﾟ･　★　･ﾟﾟ･｡
🌟 Sᴜᴘᴇʀ Sᴀɪʏᴀɴ Mᴏᴅᴇ Aᴄᴛɪᴠᴀᴛᴇᴅ 🌟
｡･ﾟﾟ･　★　･ﾟﾟ･｡

༺🌙 𝐑𝐗 𝐀𝐁𝐃𝐔𝐋𝐋𝐀𝐇 𝐁𝐎𝐒𝐒 𝐎𝐅 𝐁𝐎𝐒𝐒𝐄𝐒 🌙༻`;

  try {
    const response = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://imgur.com/"
      }
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: styledText,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath); // auto delete
      }, event.messageID);
    });

    writer.on("error", (err) => {
      console.error("Save error:", err);
      api.sendMessage("❌ Video save failed.", event.threadID);
    });

  } catch (err) {
    console.error("Download error:", err.message);
    api.sendMessage("❌ Could not download the video.", event.threadID);
  }
};

module.exports.run = async () => {};
