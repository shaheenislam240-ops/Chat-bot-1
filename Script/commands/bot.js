const axios = require("axios");
const simapi = "https://rx-simisimi-api.onrender.com/api?text=";

module.exports.config = {
  name: "Obot",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "OpenAI | Custom for Abdullah",
  description: "",
  commandCategory: "noprefix",
  usages: "",
  cooldowns: 2
};

const replyMap = {
  sona: [
    "তুমি জান আমার সব ❤️", "কি হয়েছে বলো 😚", "এত আদর করো কেন 🥹", "ভালোবাসি জান 🫶"
  ],
  abdullah: [
    "বস আব্দুল্লাহ অনেক হ্যান্ডসাম 😎\nতাঁর মতো ছেলে আর নাই 😌\nতুমি ওনার ফ্যান না?",
    "জানু আব্দুল্লাহ আমার সব 🥵\nওর জন্য পাগল আমি 🥰\nওকে ডেকো না বেশি 😤",
    "আব্দুল্লাহ মানেই ভালোবাসা 🫠\nউনি আসলেই লিজেন্ড 😈\nতাকে ভুলে যেও না"
  ],
  baby: [
    "আমি বেবি, cute type 😽\nতুমি কেমন আছো? 😊\nডিস্টার্ব দিও না 😾",
    "Baby is busy right now 😤\nতুমি পরে এসো 🙄\nআসলে ভালোবাসা দিবো 😚",
    "Baby বললেই আমি melt 😳\nতুমি বলো, কি চাও 🫣\nতুমি কি আমার crush?"
  ]
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const { body, senderID, threadID, messageID, messageReply } = event;
  if (!body) return;
  const name = await Users.getNameUser(senderID);
  const lower = body.toLowerCase();

  if (messageReply && messageReply.senderID == api.getCurrentUserID()) {
    try {
      const query = encodeURIComponent(body);
      const res = await axios.get(`${simapi}${query}`);
      const reply = res.data.message;
      if (reply) return api.sendMessage(reply, threadID, messageID);
    } catch {
      return api.sendMessage("😿 Bot uttor dite parlo na!", threadID, messageID);
    }
    return;
  }

  for (const key of Object.keys(replyMap)) {
    if (lower === key) {
      const list = replyMap[key];
      const randomReply = list[Math.floor(Math.random() * list.length)];
      const msg = {
        body: `@${name} ${randomReply}`,
        mentions: [{ tag: `@${name}`, id: senderID }]
      };
      return api.sendMessage(msg, threadID, messageID);
    }
  }
};

module.exports.run = function () {};
