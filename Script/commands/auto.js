module.exports = {
  config: {
    name: "autodl",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "Maria x rX",
    description: "Auto video downloader from TikTok (No-Watermark), YouTube, Instagram, Twitter, Facebook",
    commandCategory: "media",
    usages: "",
    cooldowns: 5,
  },

  run: async () => {},

  handleEvent: async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const content = event.body?.trim();
    const messageID = event.messageID;
    const threadID = event.threadID;

    if (!content || !content.startsWith("https://")) return;

    let videoURL = "", title = "", platform = "", path = __dirname + "/cache/autodl.mp4";

    try {
      // TikTok (No Watermark)
      if (content.includes("tiktok.com")) {
        platform = "TikTok";
        api.setMessageReaction("🎵", messageID, () => {}, true);
        const res = await axios.get(`https://api.akuari.my.id/downloader/tiktok?link=${encodeURIComponent(content)}`);
        videoURL = res.data?.result?.video;
        title = res.data?.result?.title || "TikTok Video";
      }

      // YouTube
      else if (content.includes("youtube.com") || content.includes("youtu.be")) {
        platform = "YouTube";
        api.setMessageReaction("🎬", messageID, () => {}, true);
        const res = await axios.get(`https://api.akuari.my.id/downloader/youtube?link=${encodeURIComponent(content)}`);
        videoURL = res.data?.mp4?.url || res.data?.url;
        title = res.data?.title || "YouTube Video";
      }

      // Instagram
      else if (content.includes("instagram.com")) {
        platform = "Instagram";
        api.setMessageReaction("📸", messageID, () => {}, true);
        const res = await axios.get(`https://api.akuari.my.id/downloader/igdl2?link=${encodeURIComponent(content)}`);
        videoURL = res.data?.url?.[0];
        title = "Instagram Video";
      }

      // Twitter/X
      else if (content.includes("twitter.com") || content.includes("x.com")) {
        platform = "Twitter";
        api.setMessageReaction("🐦", messageID, () => {}, true);
        const res = await axios.get(`https://api.akuari.my.id/downloader/twitter?link=${encodeURIComponent(content)}`);
        videoURL = res.data?.url;
        title = res.data?.title || "Twitter Video";
      }

      // Facebook
      else if (content.includes("facebook.com") || content.includes("fb.watch")) {
        platform = "Facebook";
        api.setMessageReaction("📘", messageID, () => {}, true);
        const res = await axios.get(`https://api.akuari.my.id/downloader/fb?link=${encodeURIComponent(content)}`);
        videoURL = res.data?.url?.[0];
        title = "Facebook Video";
      }

      if (!videoURL) {
        return api.sendMessage("❌ Unable to download video. Please check the link.", threadID, messageID);
      }

      const videoBuffer = (await axios.get(videoURL, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path, Buffer.from(videoBuffer, "utf-8"));

      const caption = `🎞️ ${title}\n\nrX Auto Download 🐣 [${platform}]`;

      return api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(path)
      }, threadID, () => fs.unlinkSync(path), messageID);

    } catch (err) {
      console.error("❌ Error downloading video:", err.message || err);
      return api.sendMessage("🚫 Something went wrong while downloading the video.", threadID, messageID);
    }
  }
};
