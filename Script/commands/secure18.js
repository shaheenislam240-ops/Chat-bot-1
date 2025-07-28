const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "secure18",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "rX (rX Vault System) + Maria Update",
  description: "🔞 Admin-only 18+ vault with auto unsend & next video",
  commandCategory: "admin",
  usages: "[exact keyword only]",
  cooldowns: 3,
  prefix: false
};

const allowedAdmins = ["100068565380737", "61554657546543"];

const keywordDB = {
  "mia khalifa video": ["https://pixeldrain.com/api/file/xyz123"],
  "deshi collection": [
    "https://pixeldrain.com/api/file/VH3tMhyz",
    "https://pixeldrain.com/api/file/v8ojuLRU"
  ],
  "bd desi video": ["https://pixeldrain.com/api/file/def789"],
  "deshi sex": [
    "https://pixeldrain.com/u/4KsH5vxP",
    "https://pixeldrain.com/u/qK9SiG6m",
    "https://pixeldrain.com/u/47tBBRdv",
    "https://pixeldrain.com/u/Awwy3Nga",
    "https://pixeldrain.com/u/kfi2idNE",
    "https://pixeldrain.com/u/GwjjET71"
  ]
};

const activeSessions = {}; // Stores current video sessions by thread

function getRandomVideo(videos, exclude) {
  const filtered = videos.filter(v => v !== exclude);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

module.exports.handleEvent = async function ({ api, event }) {
  const { body, senderID, threadID, messageID, messageReply } = event;
  if (!body) return;

  const messageText = body.toLowerCase().trim();

  // Handle "next" request for same thread
  if (body.toLowerCase() === "next" && activeSessions[threadID]) {
    const session = activeSessions[threadID];
    if (session.timeout) clearTimeout(session.timeout);
    if (session.sentMessageID) {
      try {
        await api.unsendMessage(session.sentMessageID);
      } catch (e) {}
    }

    const nextVideo = getRandomVideo(session.videos, session.lastVideo);
    if (!nextVideo) return api.sendMessage("✅ No more videos available.", threadID, messageID);

    const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);
    try {
      const response = await axios({
        method: "GET",
        url: nextVideo,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `🔞 Here's the next secure video.\n⏳ Auto-delete in 2 minutes.`,
          attachment: fs.createReadStream(filePath)
        }, threadID, async (err, info) => {
          if (err) return;

          activeSessions[threadID] = {
            ...session,
            lastVideo: nextVideo,
            sentMessageID: info.messageID,
            timeout: setTimeout(() => {
              api.unsendMessage(info.messageID);
              fs.unlinkSync(filePath);
              delete activeSessions[threadID];
            }, 2 * 60 * 1000)
          };
        }, messageID);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error loading next video.", threadID, messageID);
    }

    return;
  }

  // Check if keyword matches
  if (!Object.keys(keywordDB).includes(messageText)) return;
  if (!allowedAdmins.includes(senderID)) {
    return api.sendMessage("⚠️ Only rX Abdullah can authorize this command.", threadID, messageID);
  }

  const videos = keywordDB[messageText];
  const videoURL = getRandomVideo(videos);
  const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);

  try {
    const response = await axios({
      method: "GET",
      url: videoURL,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `🔞 Here's your secure video: "${messageText}"\n⏳ Auto-delete in 2 minutes.\n💬 Reply "next" to get another.`,
        attachment: fs.createReadStream(filePath)
      }, threadID, (err, info) => {
        if (err) return;

        const timeout = setTimeout(() => {
          api.unsendMessage(info.messageID);
          fs.unlinkSync(filePath);
          delete activeSessions[threadID];
        }, 2 * 60 * 1000);

        activeSessions[threadID] = {
          videos,
          lastVideo: videoURL,
          sentMessageID: info.messageID,
          timeout
        };
      }, messageID);
    });

    writer.on("error", () => {
      api.sendMessage("❌ Error writing the video file.", threadID, messageID);
    });

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to fetch the secure video.", threadID, messageID);
  }
};

module.exports.run = () => {};
