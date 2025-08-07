const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ADMIN_UID = "100068565380737"; // আপনার UID

const videos = [
  {
    title: "Deshi Cultural Program 📺",
    url: "https://pixeldrain.com/u/VH3tMhyz"
  },
  {
    title: "Traditional Wedding Dance 💃",
    url: "https://pixeldrain.com/u/4KsH5vxP"
  },
  {
    title: "College Function Highlights 🎉",
    url: "https://pixeldrain.com/u/Awwy3Nga"
  },
  {
    title: "Village Festival Celebration 🌾",
    url: "https://pixeldrain.com/u/kfi2idNE"
  }
];

let currentIndex = {};

module.exports.config = {
  name: "deshivideo",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "rX + Priyansh",
  description: "🎬 Random Deshi video with cache save/send system",
  commandCategory: "media",
  usages: "[!deshi video | next]",
  cooldowns: 3,
  prefix: false
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  if (!body) return;

  const message = body.trim().toLowerCase();

  if (!["!deshi video", "next"].includes(message)) return;

  if (senderID !== ADMIN_UID) {
    return api.sendMessage("⚠️ Only rX Abdullah can use this command.", threadID, messageID);
  }

  if (!currentIndex[threadID] || message === "!deshi video") {
    currentIndex[threadID] = 0;
  } else {
    currentIndex[threadID]++;
    if (currentIndex[threadID] >= videos.length) currentIndex[threadID] = 0;
  }

  const { title, url } = videos[currentIndex[threadID]];
  const cacheDir = path.join(__dirname, "noprefix", "cache");

  try {
    await fs.ensureDir(cacheDir);
    const filename = `${Date.now()}.mp4`;
    const filepath = path.join(cacheDir, filename);

    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(filepath, res.data);

    api.sendMessage({
      body: `🎥 ${title}\n⏳ Auto delete in 2 mins.\n\n👉 Next? Type: next`,
      attachment: fs.createReadStream(filepath)
    }, threadID, async (err, info) => {
      if (err) {
        fs.unlinkSync(filepath);
        return;
      }

      setTimeout(() => {
        api.unsendMessage(info.messageID);
        fs.unlink(filepath);
      }, 2 * 60 * 1000);
    });
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ ভিডিও ডাউনলোডে সমস্যা হয়েছে।", threadID, messageID);
  }
};

module.exports.run = () => {};
