const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
  return base.data.api;
};

module.exports = {
  config: {
    name: "gan",
    version: "1.0.0",
    credits: "dipto + modified by Rx Abdullah",
    description: "Directly download and send first YouTube video by song name",
    hasPermssion: 0,
    commandCategory: "media",
    usages: "{pn} [song name]",
    cooldowns: 3
  },

  run: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    if (!query) return api.sendMessage("❌ গানটির নাম দিন!\nযেমন: !gan tumi amar", threadID, messageID);

    // Step 1: Searching message
    const searchMsg = await api.sendMessage("🔍 Searching video...", threadID, messageID);

    try {
      // Step 2: Search first result
      const result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(query)}`)).data[0];
      if (!result) {
        await api.unsendMessage(searchMsg.messageID);
        return api.sendMessage("❌ কোনো ভিডিও পাওয়া যায়নি!", threadID, messageID);
      }

      const videoID = result.id;
      const format = "mp4";
      const path = `ytb_${videoID}.${format}`;

      // Step 3: Get download link
      const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=${format}&quality=3`);

      // Step 4: Download video
      const res = await axios.get(downloadLink, { responseType: "arraybuffer" });
      fs.writeFileSync(path, Buffer.from(res.data));

      const size = fs.statSync(path).size;

      // Step 5: Unsend searching message
      await api.unsendMessage(searchMsg.messageID);

      // Step 6: Check file size
      if (size > 26 * 1024 * 1024) {
        fs.unlinkSync(path);
        return api.sendMessage("❌ ভিডিওটি ২৬MB এর বেশি, তাই পাঠানো যাচ্ছে না।", threadID, messageID);
      }

      // Step 7: Send video
      return api.sendMessage({
        body: `✅ Title: ${title}\n📥 Quality: ${quality}`,
        attachment: fs.createReadStream(path)
      }, threadID, () => fs.unlinkSync(path), messageID);

    } catch (err) {
      console.error(err);
      try { await api.unsendMessage(searchMsg.messageID); } catch (_) {}
      return api.sendMessage("❌ কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।", threadID, messageID);
    }
  }
};
