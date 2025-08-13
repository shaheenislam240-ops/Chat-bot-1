const axios = require("axios");
const cheerio = require("cheerio");

module.exports.config = {
  name: "xxvideo",
  version: "2.0.0",
  hasPermssion: 2,
  credits: "rX Abdullah + Maria AI",
  description: "Send random 18+ xnxx video without API",
  commandCategory: "18+",
  usages: "xx video",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ event, api }) {
  const trigger = event.body.toLowerCase();
  if (trigger.includes("xx video")) {
    try {
      const searchURL = "https://www.xnxx.com/search/bangladeshi";
      const res = await axios.get(searchURL, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const $ = cheerio.load(res.data);
      const videos = [];

      $(".mozaique .thumb").each((_, el) => {
        const title = $(el).find("p a").text().trim();
        const link = "https://www.xnxx.com" + $(el).find("a").attr("href");
        const thumb = $(el).find("img").attr("data-src");
        const duration = $(el).find(".duration").text().trim();
        if (title && link && thumb) {
          videos.push({ title, link, thumb, duration });
        }
      });

      if (videos.length === 0) {
        return api.sendMessage("❌ No video found.", event.threadID);
      }

      const random = videos[Math.floor(Math.random() * videos.length)];

      const msg = `🔞 Title: ${random.title}\n⏱ Duration: ${random.duration}\n🔗 Watch: ${random.link}`;
      const img = (await axios.get(random.thumb, { responseType: "stream" })).data;

      return api.sendMessage({ body: msg, attachment: img }, event.threadID, event.messageID);
    } catch (err) {
      console.error("Scrape Error:", err.message);
      return api.sendMessage("❌ Failed to fetch from XNXX directly.", event.threadID);
    }
  }
};

module.exports.run = async () => {};
