const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!fs.existsSync(path.join(__dirname, "cache"))) {
  fs.mkdirSync(path.join(__dirname, "cache"));
}

module.exports.config = {
  name: "secure18",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "rX (rX Vault System)",
  description: "🔞 Secure 18+ vault with auto unsend & next reply",
  commandCategory: "admin",
  usages: "[exact keyword only]",
  cooldowns: 3,
  prefix: false
};

const allowedAdmins = ["100068565380737", "61554657546543"];

const keywordDB = {
  "deshi sex": [
    "https://pixeldrain.com/u/4KsH5vxP",
    "https://pixeldrain.com/u/qK9SiG6m",
    "https://pixeldrain.com/u/47tBBRdv",
    "https://pixeldrain.com/u/Awwy3Nga",
    "https://pixeldrain.com/u/kfi2idNE",
    "https://pixeldrain.com/u/GwjjET71"
  ],
  "deshi video": ["https://pixeldrain.com/u/VH3tMhyz"],
  "deshi xx video": ["https://pixeldrain.com/u/v8ojuLRU"]
};

const activeThreads = {};

function getRandomVideo(videos) {
  return videos[Math.floor(Math.random() * videos.length)];
}

async function downloadVideo(url, filename) {
  const filePath = path.join(__dirname, "cache", filename);
  const res = await axios({ url, method: "GET", responseType: "stream" });
  const writer = fs.createWriteStream(filePath);
  res.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
}

module.exports.handleEvent = async function ({ api, event }) {
  const { body, senderID, threadID, messageID, type, messageReply } = event;
  const messageText = body?.toLowerCase().trim();
  if (!messageText) return;

  // 🔁 Handle "next" reply
  if (messageText === "next" && messageReply?.messageID && activeThreads[threadID]?.lastSent) {
    if (!allowedAdmins.includes(senderID)) return;

    try {
      const { lastSent, keyword, usedLinks } = activeThreads[threadID];

      // Remove used
      await api.unsendMessage(lastSent.messageID);
      if (fs.existsSync(lastSent.filePath)) fs.unlinkSync(lastSent.filePath);

      const options = keywordDB[keyword].filter(link => !usedLinks.includes(link));
      if (options.length === 0) {
        return api.sendMessage("✅ No more videos left. Start over again!", threadID);
      }

      const nextLink = getRandomVideo(options);
      const fileName = `${Date.now()}_next.mp4`;
      const filePath = await downloadVideo(nextLink, fileName);

      const msg = {
        body: `🔁 Here's your next video from "${keyword}"\n⏳ Auto-delete in 2 minutes.`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        activeThreads[threadID].lastSent = { messageID: info.messageID, filePath };
        activeThreads[threadID].usedLinks.push(nextLink);

        setTimeout(() => {
          api.unsendMessage(info.messageID);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, 2 * 60 * 1000);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error loading next video.", threadID);
    }

    return;
  }

  // 🔑 Main keyword match
  if (!Object.keys(keywordDB).includes(messageText)) return;
  if (!allowedAdmins.includes(senderID)) {
    return api.sendMessage("⛔ Only rX Abdullah can use this.", threadID, messageID);
  }

  const videos = keywordDB[messageText];
  const selectedLink = getRandomVideo(videos);

  try {
    const fileName = `${Date.now()}_main.mp4`;
    const filePath = await downloadVideo(selectedLink, fileName);

    const msg = {
      body: `🔞 Here's your secure video: "${messageText}"\n⏳ Auto-delete in 2 minutes.\n💬 Reply "next" for more.`,
      attachment: fs.createReadStream(filePath)
    };

    api.sendMessage(msg, threadID, (err, info) => {
      if (err) return;
      activeThreads[threadID] = {
        keyword: messageText,
        usedLinks: [selectedLink],
        lastSent: { messageID: info.messageID, filePath }
      };

      setTimeout(() => {
        api.unsendMessage(info.messageID);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 2 * 60 * 1000);
    }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Couldn't fetch the video.", threadID, messageID);
  }
};

module.exports.run = () => {};
