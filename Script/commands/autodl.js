module.exports = {
  config: {
    name: "autodl",
    version: "0.0.2",
    hasPermssion: 0,
    credits: "𝐫𝐗",
    description: "Auto video downloader with platform name",
    commandCategory: "user",
    usages: "",
    cooldowns: 5,
  },

  run: async function({ api, event, args }) {},

  handleEvent: async function ({ api, event }) {
    const axios = require("axios");
    const request = require("request");
    const fs = require("fs-extra");
    const { alldown } = require("shaon-videos-downloader");

    const content = event.body ? event.body : '';
    const body = content.toLowerCase();

    if (!body.startsWith("https://")) return;

    // React while processing
    api.setMessageReaction("🐣", event.messageID, (err) => {}, true);

    try {
      const data = await alldown(content);
      if (!data || !data.url) {
        return api.sendMessage("❌ Failed to fetch video.", event.threadID, event.messageID);
      }

      const videoUrl = data.url;

      // Detect platform from URL
      let platform = "Unknown";
      if (content.includes("tiktok.com")) platform = "TikTok";
      else if (content.includes("youtube.com") || content.includes("youtu.be")) platform = "YouTube";
      else if (content.includes("instagram.com")) platform = "Instagram";
      else if (content.includes("facebook.com")) platform = "Facebook";

      // Download video
      const video = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
      const filePath = __dirname + "/cache/auto.mp4";
      fs.writeFileSync(filePath, Buffer.from(video, "utf-8"));

      // React done
      api.setMessageReaction("🧃", event.messageID, (err) => {}, true);

      // Send message with formatted caption
      const caption = `<rX-Bot>\n[✓] Video Processed\n[▶] Source: ${platform}\n</rX-Bot>`;

      return api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath); // Delete file after sending
      }, event.messageID);

    } catch (e) {
      console.error("❌ autodl error:", e.message);
      return api.sendMessage("❌ Error occurred while downloading video.", event.threadID, event.messageID);
    }
  }
};
