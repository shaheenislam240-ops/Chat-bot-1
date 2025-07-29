const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "abdullahvideo",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "rX Abdullah + Maria",
  description: "Send random video if 'abdullah' is mentioned (no repeat)",
  commandCategory: "auto",
  usages: "",
  cooldowns: 0,
  prefix: false
};

// ✅ ভিডিও তালিকা
const videoList = [
  {
    url: "https://files.catbox.moe/206yiy.mp4",
    title: "╭•┄┅════❁🌺❁════┅┄•╮\n   🥺 rX Abdullah... 💔\n╰•┄┅════❁🌺❁════┅┄•╯"
  },
  {
    url: "https://files.catbox.moe/ox1mn0.mov",
    title: "╭•┄┅════❁🌺❁════┅┄•╮\n   🎬 For rX Abdullah with love 💖\n╰•┄┅════❁🌺❁════┅┄•╯"
  }
];

// ✅ প্রতিটা থ্রেডে কোন ভিডিওগুলো পাঠানো হয়েছে সেটা ট্র্যাক করবে
const sentTracker = {};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body || !body.toLowerCase().includes("abdullah")) return;

  // Initialize tracking
  if (!sentTracker[threadID]) sentTracker[threadID] = [];

  const alreadySent = sentTracker[threadID];
  const remainingVideos = videoList.filter((_, i) => !alreadySent.includes(i));

  // সব ভিডিও পাঠানো হয়ে গেলে আবার শুরু
  if (remainingVideos.length === 0) {
    sentTracker[threadID] = [];
    remainingVideos.push(...videoList);
  }

  // র‍্যান্ডমলি বাছাই
  const randomIndex = Math.floor(Math.random() * remainingVideos.length);
  const chosenVideo = remainingVideos[randomIndex];
  const actualIndex = videoList.indexOf(chosenVideo);
  sentTracker[threadID].push(actualIndex);

  // ভিডিও পাঠাও
  await sendVideo(api, threadID, messageID, chosenVideo, actualIndex);
};

async function sendVideo(api, threadID, replyTo, video, index) {
  const fileName = `abdullah_${index}.mp4`;
  const filePath = path.join(__dirname, fileName);

  try {
    const res = await axios.get(video.url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, res.data);

    api.sendMessage({
      body: video.title,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath), replyTo);
  } catch (err) {
    console.error("❌ Error sending video:", err.message);
  }
}

module.exports.run = () => {};
