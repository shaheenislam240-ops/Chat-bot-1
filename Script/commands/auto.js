module.exports = {
  config: {
    name: "autodl",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "rX Abdullah",
    description: "Auto detect and download videos from YouTube, TikTok, Instagram, etc.",
    commandCategory: "user",
    usages: "",
    cooldowns: 5,
  },

  run: async function ({ api, event }) {},

  handleEvent: async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const { alldown } = require("rx-dawonload");

    // message content
    const content = event.body ? event.body.trim() : "";
    if (!content.startsWith("https://")) return;

    try {
      // Detect site type
      let site = "Unknown";
      if (content.includes("youtube.com") || content.includes("youtu.be")) site = "YouTube";
      else if (content.includes("tiktok.com")) site = "TikTok";
      else if (content.includes("instagram.com")) site = "Instagram";
      else if (content.includes("facebook.com")) site = "Facebook";

      api.setMessageReaction("🔍", event.messageID, () => {}, true);
      api.sendMessage(`🎥 Detected platform: ${site}\n⏳ Downloading...`, event.threadID);

      // Download data
      const data = await alldown(content);
      if (!data || !data.url) return api.sendMessage("❌ Failed to get download link.", event.threadID);

      const title = data.title || "unknown_video";
      const videoUrl = data.url;

      api.setMessageReaction("⬇️", event.messageID, () => {}, true);

      // Download video file
      const videoBuffer = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
      const filePath = __dirname + "/cache/" + title.replace(/[^\w\s]/gi, "_") + ".mp4";
      fs.writeFileSync(filePath, Buffer.from(videoBuffer, "utf-8"));

      // Send video with title and source
      api.sendMessage(
        {
          body: `🎀 Download Complete!\n📍 Source: ${site}\n🎬 Title: ${title}`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        (err) => {
          fs.unlinkSync(filePath);
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error downloading video.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },
};
