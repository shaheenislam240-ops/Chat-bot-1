const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "abdullahvideo",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah + Maria",
  description: "Send 1 of 2 random videos when 'abdullah' is mentioned",
  commandCategory: "auto",
  usages: "",
  cooldowns: 0,
  prefix: false
};

const videos = [
  {
    url: "https://files.catbox.moe/206yiy.mp4",
    title: "╭•┄┅════❁🌺❁════┅┄•╮\n   🥺 rX Abdullah... 💔\n╰•┄┅════❁🌺❁════┅┄•╯"
  },
  {
    url: "https://files.catbox.moe/ox1mn0.mov",
    title: "╭•┄┅════❁🌺❁════┅┄•╮\n   🎬 For rX Abdullah with love 💖\n╰•┄┅════❁🌺❁════┅┄•╯"
  }
];

const sentVideos = {};

module.exports.handleEvent = async ({ api, event }) => {
  const { body, threadID, messageID } = event;
  if (!body) return;

  const match = body.toLowerCase().includes("abdullah");
  if (!match) return;

  if (!sentVideos[threadID]) sentVideos[threadID] = [];

  const sent = sentVideos[threadID];
  const remaining = videos.filter((_, i) => !sent.includes(i));

  if (remaining.length === 0) {
    sentVideos[threadID] = [];
    remaining.push(...videos);
  }

  const random = remaining[Math.floor(Math.random() * remaining.length)];
  const actualIndex = videos.indexOf(random);
  sentVideos[threadID].push(actualIndex);

  try {
    const res = await axios.get(random.url, { responseType: "arraybuffer" });
    const filePath = path.join(__dirname, `temp_abdullah_${Date.now()}.mp4`);
    fs.writeFileSync(filePath, res.data);

    api.sendMessage(
      {
        body: random.title,
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => fs.unlinkSync(filePath),
      messageID
    );
  } catch (err) {
    console.log("❌ Video send error:", err);
  }
};

module.exports.run = () => {};
