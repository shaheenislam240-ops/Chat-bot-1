const axios = require("axios");

module.exports.config = {
  name: "secure18",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX (Basic by Maria)",
  description: "🔞 Simple 18+ command with 'next' support",
  commandCategory: "admin",
  usages: "[exact keyword]",
  cooldowns: 3,
  prefix: false
};

const allowedAdmins = ["100068565380737"];

const keywordDB = {
  "deshi link": [
    "https://pixeldrain.com/u/4KsH5vxP",
    "https://pixeldrain.com/u/qK9SiG6m",
    "https://pixeldrain.com/u/47tBBRdv",
    "https://pixeldrain.com/u/Awwy3Nga",
    "https://pixeldrain.com/u/kfi2idNE",
    "https://pixeldrain.com/u/GwjjET71"
  ],
  "deshi video": [
    "https://pixeldrain.com/u/VH3tMhyz"
  ],
  "deshi xx video": [
    "https://pixeldrain.com/u/v8ojuLRU"
  ]
};

const sessions = {};

function getRandomVideo(list, last) {
  const filtered = list.filter(link => link !== last);
  return filtered[Math.floor(Math.random() * filtered.length)] || last;
}

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, senderID, messageID } = event;
  if (!body) return;

  const lower = body.toLowerCase().trim();

  // Handle next
  if (lower === "next" && sessions[threadID]) {
    const session = sessions[threadID];
    const nextVideo = getRandomVideo(session.videos, session.lastVideo);

    try {
      const res = await axios({
        method: "GET",
        url: nextVideo,
        responseType: "stream"
      });

      api.sendMessage({
        body: `🔞 Here's the next video.\n⏳ Auto-delete in 2 minutes.`,
        attachment: res.data
      }, threadID, (err, info) => {
        if (err) return;
        sessions[threadID] = {
          ...session,
          lastVideo: nextVideo,
          messageID: info.messageID
        };

        setTimeout(() => {
          api.unsendMessage(info.messageID);
          delete sessions[threadID];
        }, 2 * 60 * 1000);
      });

    } catch (e) {
      return api.sendMessage("❌ Couldn't load next video.", threadID, messageID);
    }

    return;
  }

  if (!Object.keys(keywordDB).includes(lower)) return;
  if (!allowedAdmins.includes(senderID)) {
    return api.sendMessage("⚠️ Only rX Abdullah can access this command.", threadID, messageID);
  }

  const videoList = keywordDB[lower];
  const selected = getRandomVideo(videoList);

  try {
    const res = await axios({
      method: "GET",
      url: selected,
      responseType: "stream"
    });

    api.sendMessage({
      body: `🔞 Video for "${lower}"\n💬 Reply "next" for another.\n⏳ Auto-delete in 2 minutes.`,
      attachment: res.data
    }, threadID, (err, info) => {
      if (err) return;
      sessions[threadID] = {
        videos: videoList,
        lastVideo: selected,
        messageID: info.messageID
      };

      setTimeout(() => {
        api.unsendMessage(info.messageID);
        delete sessions[threadID];
      }, 2 * 60 * 1000);
    });

  } catch (e) {
    return api.sendMessage("❌ Couldn't load video.", threadID, messageID);
  }
};

module.exports.run = () => {};
