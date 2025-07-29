const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "abdullah",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Sends stylish message + Imgur video when 'abdullah' is mentioned",
  commandCategory: "media",
  usages: "noprefix",
  cooldowns: 3
};

module.exports.handleEvent = async function ({ api, event }) {
  const message = event.body?.toLowerCase();
  if (!message || !message.includes("abdullah")) return;

  const videoUrl = "https://i.imgur.com/8tJ70qr.mp4";
  const videoPath = path.join(__dirname, "cache", "abdullah_video.mp4");

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
      responseType: "stream"
    });

    const writer = fs.createWriteStream(videoPath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: styledText,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, () => fs.unlinkSync(videoPath), event.messageID);
    });

    writer.on("error", (err) => {
      console.error("Write error:", err);
      api.sendMessage("❌ Video save error.", event.threadID);
    });

  } catch (err) {
    console.error("Download error:", err.message);
    api.sendMessage("❌ Could not download video.", event.threadID);
  }
};

module.exports.run = async function () {};
