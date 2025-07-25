const axios = require("axios");
const fs = require("fs-extra");
const tinyurl = require("tinyurl");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
  );
  return base.data.api;
};

module.exports.config = {
  name: "autodl",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Modified by Maria | Base by Dipto",
  description: "Auto downloader for multiple platforms",
  commandCategory: "media",
  usages: "Send a video/photo link (Tiktok, YouTube, FB, Insta etc.)",
  cooldowns: 2,
  dependencies: {
    axios: "",
    "fs-extra": "",
    tinyurl: "",
  },
};

module.exports.handleEvent = async function ({ api, event }) {
  const content = event.body ? event.body.trim() : "";
  if (!content.startsWith("https://")) return;

  try {
    // Platforms supported
    const platforms = [
      "vt.tiktok.com",
      "vm.tiktok.com",
      "www.facebook.com",
      "fb.watch",
      "instagram.com",
      "pin.it",
      "youtube.com",
      "youtu.be",
      "i.imgur.com"
    ];

    const isSupported = platforms.some(p => content.includes(p));
    if (!isSupported) return;

    // Special case for Imgur
    if (content.startsWith("https://i.imgur.com")) {
      const ext = content.substring(content.lastIndexOf("."));
      const imgData = await axios.get(content, { responseType: "arraybuffer" });
      const imgPath = `${__dirname}/cache/img${ext}`;
      fs.writeFileSync(imgPath, Buffer.from(imgData.data, "binary"));
      return api.sendMessage({
        body: `🖼️ Image downloaded\nrX Auto Download 🐣`,
        attachment: fs.createReadStream(imgPath),
      }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
    }

    // Normal downloader
    api.setMessageReaction("⏬", event.messageID, () => {}, true);

    const apiUrl = await baseApiUrl();
    const res = await axios.get(`${apiUrl}/alldl?url=${encodeURIComponent(content)}`);
    const data = res.data;

    if (!data.result) {
      return api.sendMessage(`❌ Failed to fetch video.`, event.threadID, event.messageID);
    }

    const shortUrl = await tinyurl.shorten(data.result);
    const fileExt = data.result.includes(".jpg") ? ".jpg" :
                    data.result.includes(".png") ? ".png" :
                    data.result.includes(".jpeg") ? ".jpeg" : ".mp4";

    const filePath = `${__dirname}/cache/video${fileExt}`;
    const fileData = (await axios.get(data.result, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(filePath, Buffer.from(fileData, "utf-8"));

    const title = data.title || "Downloaded Video";

    api.sendMessage({
      body: `🎬 ${title}\n\nrX Auto Download 🐣\n✅ 🔗 ${shortUrl}`,
      attachment: fs.createReadStream(filePath),
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

  } catch (e) {
    api.sendMessage(`⚠️ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.run = () => {};
