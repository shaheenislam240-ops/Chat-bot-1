const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "autodl",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX",
  description: "Auto detect and download TikTok/Instagram/Facebook video",
  commandCategory: "media",
  usages: "Just send a video link",
  cooldowns: 3,
};

module.exports.handleEvent = async function({ api, event }) {
  const { body } = event;
  if (!body) return;

  // Regex দিয়ে link detect
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = body.match(urlPattern);
  if (!urls) return;

  for (const url of urls) {
    if (
      url.includes("tiktok.com") ||
      url.includes("instagram.com") ||
      url.includes("facebook.com") ||
      url.includes("fb.watch")
    ) {
      try {
        // First reply "Downloading..."
        api.sendMessage("⬇️ Downloading video, please wait...", event.threadID, event.messageID);

        // Step 1: TinyURL দিয়ে short
        const short = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        const shortUrl = short.data;

        // Step 2: Matli API call
        const res = await axios.get("https://api.matli.com/download", {
          params: { url: url },
          headers: {
            Authorization: "Bearer z9UGLYCHRrnAHWRCx2Pc6Mx3F1YDkTiz3A8DvwulgYcitSyBBilR4XYyf78X"
          }
        });

        if (!res.data || !res.data.video) {
          return api.sendMessage("❌ Sorry, video not found.", event.threadID, event.messageID);
        }

        const downloadUrl = res.data.video;

        // Step 3: ভিডিও ডাউনলোড
        const filePath = path.join(__dirname, "cache", `video_${Date.now()}.mp4`);
        const file = await axios.get(downloadUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(file.data, "binary"));

        // Step 4: ভিডিও group এ পাঠানো
        api.sendMessage(
          {
            body: `✅ Auto Downloaded Video\n🔗 Short Link: ${shortUrl}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );

      } catch (err) {
        api.sendMessage("⚠️ Video download failed.", event.threadID, event.messageID);
        console.error(err);
      }
    }
  }
};

module.exports.run = async function() {
  // manual run দরকার নাই
  return;
};
