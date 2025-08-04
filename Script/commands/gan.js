const axios = require("axios");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "gan",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX",
  description: "Searches and sends YouTube video",
  commandCategory: "media",
  usages: "[song name]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const config = require("./config.json");
const apiKey = config.YOUTUBE_API_KEY;

  if (!query) return api.sendMessage("❌ Please provide a song name.", event.threadID, event.messageID);

  const searchingMsg = `🔍 Searching for: ${query}...`;
  const sentMsg = await api.sendMessage(searchingMsg, event.threadID);

  try {
    // ইউটিউব সার্চ
    const res = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: "snippet",
        q: query,
        key: apiKey,
        maxResults: 1,
        type: "video"
      }
    });

    const video = res.data.items[0];
    if (!video) {
      api.unsendMessage(sentMsg.messageID);
      return api.sendMessage("❌ No results found.", event.threadID);
    }

    const videoId = video.id.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const title = video.snippet.title.replace(/[\\/:*?"<>|]/g, "_"); // ফাইলের নাম safe করার জন্য
    const filePath = path.join(__dirname, "cache", `${title}_${videoId}.mp4`);

    // ভিডিও ডাউনলোড (lowest quality for size limit)
    const stream = ytdl(videoUrl, { quality: "lowest", filter: "audioandvideo" });
    const file = fs.createWriteStream(filePath);
    stream.pipe(file);

    stream.on("end", async () => {
      api.unsendMessage(sentMsg.messageID);

      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > 26) {
        fs.unlinkSync(filePath);
        return api.sendMessage(`❌ The video is too large (${fileSizeInMB.toFixed(2)}MB). Must be under 26MB.`, event.threadID);
      }

      return api.sendMessage({
        body: `🎬 ${title}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));
    });

    stream.on("error", (err) => {
      console.error(err);
      api.unsendMessage(sentMsg.messageID);
      api.sendMessage("❌ Error downloading video.", event.threadID);
    });

  } catch (err) {
    console.error(err);
    api.unsendMessage(sentMsg.messageID);
    api.sendMessage("❌ Something went wrong while searching.", event.threadID);
  }
};
