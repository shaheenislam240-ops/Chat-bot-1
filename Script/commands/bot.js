const axios = require("axios");
const simsim = "https://rx-simisimi-api.onrender.com";

module.exports.config = {
  name: "bot",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Modified by ChatGPT",
  description: "Mention + API based reply system",
  commandCategory: "chat",
  usages: "[text]",
  cooldowns: 0,
  prefix: false
};

const triggerWords = ["sona", "abdullah"];
const fixedReplies = [
  "Bolo re baba 😒",
  "Ki hoise bolo 🫣",
  "Ai ami ekdom ready 🫶",
  "Maira dibo ekta 😑",
  "Haa bolchi toh 😌"
];

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, body, senderID, messageReply } = event;

  if (messageReply && messageReply.senderID == api.getCurrentUserID()) {
    try {
      const res = await axios.get(`${simsim}/ask?text=${encodeURIComponent(body)}&lc=bn`);
      const reply = res.data.answer || "😶";
      return api.sendMessage(reply, threadID, messageID);
    } catch (e) {
      return api.sendMessage("😓 Sorry, API error hoyeche.", threadID, messageID);
    }
  }

  if (body && triggerWords.some(word => body.toLowerCase().includes(word))) {
    const name = (await api.getUserInfo(senderID))[senderID].name;
    const randomReply = fixedReplies[Math.floor(Math.random() * fixedReplies.length)];
    return api.sendMessage({
      body: `@${name} ${randomReply}`,
      mentions: [{
        tag: `@${name}`,
        id: senderID
      }]
    }, threadID, messageID);
  }
};
