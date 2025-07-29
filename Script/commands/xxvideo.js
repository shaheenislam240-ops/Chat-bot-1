const axios = require("axios");

module.exports.config = {
  name: "xxvideo",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "rX Abdullah",
  description: "Send 18+ random video from xnxx",
  commandCategory: "18+",
  usages: "xx video",
  cooldowns: 5
};

module.exports.handleEvent = async function({ event, api }) {
  const trigger = event.body.toLowerCase();
  if (trigger.includes("xx video")) {
    try {
      const res = await axios.get("https://zenx-api.onrender.com/api/xnxx/search?query=random");
      const list = res.data.result;
      if (!list || list.length === 0) return api.sendMessage("❌ No results found.", event.threadID);

      const randomVid = list[Math.floor(Math.random() * list.length)];

      const msg = `🔞 Title: ${randomVid.title}\n⏱ Duration: ${randomVid.duration}\n👁 Views: ${randomVid.views}\n🔗 Link: ${randomVid.link}`;
      const imgStream = (await axios.get(randomVid.image, { responseType: "stream" })).data;

      return api.sendMessage({ body: msg, attachment: imgStream }, event.threadID, event.messageID);
    } catch (err) {
      console.log(err.message);
      return api.sendMessage("❌ API is not responding or blocked.", event.threadID);
    }
  }
};

module.exports.run = async function() {};
