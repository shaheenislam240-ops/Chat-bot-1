const axios = require("axios");
const fs = require("fs-extra");
const path = __dirname + "/cache/auto.mp4";

module.exports = {
  config: {
    name: "autodl",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "rX Abdullah",
    description: "Auto download videos from TikTok, YouTube, Facebook, Instagram",
    commandCategory: "Auto",
    usages: "Just send a link in group",
    cooldowns: 2,
  },

  run: async function () {},

  handleEvent: async function ({ api, event }) {
    const { body, threadID, messageID } = event;
    if (!body) return;

    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const links = body.match(urlRegex);
    if (!links) return;

    const videoLink = links.find(link =>
      /(tiktok\.com|facebook\.com|fb\.watch|instagram\.com|youtube\.com|youtu\.be)/i.test(link)
    );

    if (!videoLink) return;

    try {
      api.setMessageReaction("⏬", messageID, () => {}, true);

      // Custom API (you can later host your own if needed)
      const apiUrl = `https://api.rxabdullah.com/v1/dl?url=${encodeURIComponent(videoLink)}`;

      const res = await axios.get(apiUrl);
      if (!res.data || !res.data.url || !res.data.title) {
        return api.sendMessage("❌ Sorry bro, video download failed.", threadID, messageID);
      }

      const videoRes = await axios.get(res.data.url, { responseType: "arraybuffer" });
      fs.writeFileSync(path, Buffer.from(videoRes.data, "utf-8"));

      const msg = {
        body: `🔥 rX 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁 | ᴍᴀʀɪᴀ  
📥⚡𝗔𝘂𝘁𝗼 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿⚡📂  
🎬 𝐄𝐧𝐣𝐨𝐲 𝐭𝐡𝐞 𝐕𝐢𝐝𝐞𝐨 🎀  
📌 Title: ${res.data.title}`,
        attachment: fs.createReadStream(path)
      };

      api.sendMessage(msg, threadID, () => fs.unlinkSync(path), messageID);
    } catch (err) {
      console.log("[autodl error]", err.message);
      api.sendMessage("❌ Video download failed bro, maybe private or unsupported link.", threadID, messageID);
    }
  }
};
