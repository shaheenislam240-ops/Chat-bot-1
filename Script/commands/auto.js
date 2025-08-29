const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { alldown } = require("rx-videos-downloader");

module.exports = {
  config: {
    name: "autodl",
    version: "0.0.3",
    hasPermssion: 0,
    credits: "Fixed by rX",
    description: "Auto video downloader (TikTok, Facebook, Instagram, YouTube)",
    commandCategory: "user",
    usages: "Just paste a video link",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    return api.sendMessage("⚡ Just paste a supported video link!", event.threadID, event.messageID);
  },

  handleEvent: async function ({ api, event }) {
    const content = event.body ? event.body.trim() : "";
    if (!content.startsWith("https://")) return;

    // Supported platforms check
    if (
      !content.includes("tiktok.com") &&
      !content.includes("facebook.com") &&
      !content.includes("instagram.com") &&
      !content.includes("youtu.be") &&
      !content.includes("youtube.com")
    ) {
      return;
    }

    // React while processing
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const data = await alldown(content);
      if (!data || !data.url) {
        return api.sendMessage("❌ Failed to fetch video.", event.threadID, event.messageID);
      }

      const videoUrl = data.url;

      // Detect platform
      let platform = "Unknown";
      if (content.includes("tiktok.com")) platform = "TikTok";
      else if (content.includes("youtube.com") || content.includes("youtu.be")) platform = "YouTube";
      else if (content.includes("instagram.com")) platform = "Instagram";
      else if (content.includes("facebook.com")) platform = "Facebook";

      // File path
      const filePath = path.join(__dirname, "cache", `autodl_${Date.now()}.mp4`);

      // Download video into cache
      const response = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data));

      // React done
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // Send with caption
      const caption = `🎬 <rX-Bot>\n[✓] Video Processed\n[▶] Source: ${platform}\n</rX-Bot>`;
      return api.sendMessage(
        { body: caption, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (err) {
      console.error("❌ autodl error:", err);
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);
      return api.sendMessage("❌ Error occurred while downloading video.", event.threadID, event.messageID);
    }
  }
};
