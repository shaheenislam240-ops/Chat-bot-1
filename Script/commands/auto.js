const fs = require("fs-extra");
const path = require("path");
const ytdl = require("ytdl-core");
const fbDownloader = require("priyansh-fb-downloader");

module.exports = {
  config: {
    name: "autodl",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "rX Abdullah",
    description: "Auto download TikTok, YouTube, Instagram, Facebook videos locally",
    commandCategory: "Auto",
    usages: "Send supported video link in group",
    cooldowns: 3,
  },

  run: async function () {},

  handleEvent: async function ({ api, event }) {
    try {
      const { body, threadID, messageID } = event;
      if (!body) return;

      // Regex to find URLs
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const links = body.match(urlRegex);
      if (!links) return;

      // Find supported link
      const videoLink = links.find((link) =>
        /(tiktok\.com|facebook\.com|fb\.watch|instagram\.com|youtube\.com|youtu\.be)/i.test(link)
      );
      if (!videoLink) return;

      // Reaction: processing started
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const tempDir = path.join(__dirname, "cache");
      await fs.ensureDir(tempDir);

      // Unique filename
      const filePath = path.join(tempDir, `video_${Date.now()}.mp4`);

      // Handle YouTube links
      if (/youtu(be)?\.com|youtu\.be/.test(videoLink)) {
        // Download using ytdl-core
        const videoReadableStream = ytdl(videoLink, { quality: "highestvideo" });
        const writeStream = fs.createWriteStream(filePath);

        videoReadableStream.pipe(writeStream);

        writeStream.on("finish", async () => {
          api.setMessageReaction("✅", messageID, () => {}, true);

          api.sendMessage(
            {
              body: `🔥 rX Chat Bot | ᴍᴀʀɪᴀ\n📥 YouTube Video Downloaded Successfully!`,
              attachment: fs.createReadStream(filePath),
            },
            threadID,
            () => fs.unlinkSync(filePath),
            messageID
          );
        });

        videoReadableStream.on("error", (err) => {
          api.setMessageReaction("❌", messageID, () => {}, true);
          api.sendMessage("❌ YouTube video download failed.", threadID, messageID);
          console.error("YouTube download error:", err);
        });

        return;
      }

      // Handle Facebook & Instagram links
      if (/facebook\.com|fb\.watch|instagram\.com/.test(videoLink)) {
        // Use priyansh-fb-downloader
        const fbDownloaderInstance = new fbDownloader();

        fbDownloaderInstance
          .getInfo(videoLink)
          .then(async (info) => {
            if (!info || !info.download || info.download.length === 0) {
              api.setMessageReaction("❌", messageID, () => {}, true);
              return api.sendMessage("❌ Facebook/Instagram video info not found.", threadID, messageID);
            }

            // Pick highest quality video url
            const videoUrl = info.download[0].url;

            // Download video buffer
            const response = await fbDownloaderInstance.download(videoUrl);

            await fs.writeFile(filePath, response);

            api.setMessageReaction("✅", messageID, () => {}, true);

            api.sendMessage(
              {
                body: `🔥 rX Chat Bot | ᴍᴀʀɪᴀ\n📥 Facebook/Instagram Video Downloaded Successfully!`,
                attachment: fs.createReadStream(filePath),
              },
              threadID,
              () => fs.unlinkSync(filePath),
              messageID
            );
          })
          .catch((err) => {
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("❌ Facebook/Instagram video download failed.", threadID, messageID);
            console.error("FB/IG download error:", err);
          });

        return;
      }

      // TikTok download fallback (API based, recommend upgrading to local scraper later)
      if (/tiktok\.com/.test(videoLink)) {
        const axios = require("axios");
        try {
          const apiUrl = `https://api.rxabdullah.com/v1/dl?url=${encodeURIComponent(videoLink)}`;
          const res = await axios.get(apiUrl);

          if (!res.data || !res.data.url) throw new Error("No download URL");

          const videoRes = await axios.get(res.data.url, { responseType: "arraybuffer" });
          await fs.writeFile(filePath, videoRes.data);

          api.setMessageReaction("✅", messageID, () => {}, true);

          api.sendMessage(
            {
              body: `🔥 rX Chat Bot | ᴍᴀʀɪᴀ\n📥 TikTok Video Downloaded Successfully!`,
              attachment: fs.createReadStream(filePath),
            },
            threadID,
            () => fs.unlinkSync(filePath),
            messageID
          );
        } catch (error) {
          api.setMessageReaction("❌", messageID, () => {}, true);
          api.sendMessage("❌ TikTok video download failed.", threadID, messageID);
          console.error("TikTok download error:", error);
        }
        return;
      }

      // If link not supported
      return;
    } catch (e) {
      console.error("AutoDL handleEvent error:", e);
    }
  },
};
