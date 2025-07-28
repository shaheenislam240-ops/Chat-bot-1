const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ADMIN_UID = "100068565380737"; // শুধুমাত্র এই UID ব্যবহার করতে পারবে

const videos = [
  {
    title: "সুন্দরী মেয়ের প্রাইভেট ভিডিও",
    url: "https://pixeldrain.com/u/VH3tMhyz"
  },
  {
    title: "বাসর রাতের মোবাইল ক্যামেরা ফাঁস",
    url: "https://pixeldrain.com/u/4KsH5vxP"
  },
  {
    title: "বাংলা কলেজ গার্ল ফাস্ট টাইম",
    url: "https://pixeldrain.com/u/Awwy3Nga"
  },
  {
    title: "হিডেন ক্যামেরায় ধরা পড়লো",
    url: "https://pixeldrain.com/u/kfi2idNE"
  }
];

let currentIndex = {}; // per thread index

module.exports.config = {
  name: "secure18random",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX + Maria",
  description: "🔞 Random 18+ video system with 'next' & auto unsend",
  commandCategory: "admin",
  usages: "[trigger: pron18 | next]",
  cooldowns: 3,
  prefix: false
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  if (!body) return;

  const message = body.trim().toLowerCase();

  if (!["pron18", "next"].includes(message)) return;

  if (senderID !== ADMIN_UID) {
    return api.sendMessage("⚠️ Only rX Abdullah can authorize this command.", threadID, messageID);
  }

  if (!currentIndex[threadID] || message === "pron18") {
    currentIndex[threadID] = 0;
  } else {
    currentIndex[threadID]++;
    if (currentIndex[threadID] >= videos.length) currentIndex[threadID] = 0;
  }

  const { title, url } = videos[currentIndex[threadID]];
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);
    fs.writeFileSync(filePath, res.data);

    return api.sendMessage({
      body: `🔞 ${title}\n⏳ 2 মিনিট পর মুছে যাবে।\n\n👉 Next? Type: next`,
      attachment: fs.createReadStream(filePath)
    }, threadID, (err, info) => {
      fs.unlinkSync(filePath);
      if (err) return;

      setTimeout(() => api.unsendMessage(info.messageID), 2 * 60 * 1000);
    });
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ ভিডিও আনতে সমস্যা হয়েছে।", threadID, messageID);
  }
};

module.exports.run = () => {};
