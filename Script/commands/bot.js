const axios = require("axios");
const simsim = "https://simsimi.cyberbot.top";

module.exports.config = {
  name: "baby",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "ULLASH",
  description: "Maria Baby-style reply with frame for 'bot' trigger",
  commandCategory: "simsim",
  usages: "[message/query]",
  cooldowns: 0,
  prefix: false
};

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const uid = event.senderID;
    const senderName = await Users.getNameUser(uid);
    const query = args.join(" ").trim();

    if (!query) return; // ignore empty message

    // Normal API response for replies
    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
    const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

    for (const reply of responses) {
      await new Promise(resolve => {
        api.sendMessage(reply, event.threadID, (err, info) => resolve(), event.messageID);
      });
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage(`| Error in baby command: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, Users }) {
  try {
    const senderName = await Users.getNameUser(event.senderID);
    const replyText = event.body ? event.body.trim() : "";
    if (!replyText) return;

    // Normal API reply to replied message
    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`);
    const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

    for (const reply of responses) {
      await new Promise(resolve => {
        api.sendMessage(reply, event.threadID, (err, info) => resolve());
      });
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage(`| Error in handleReply: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    const raw = event.body ? event.body.trim().toLowerCase() : "";
    if (!raw) return;

    const senderName = await Users.getNameUser(event.senderID);
    const senderID = event.senderID;

    // First custom trigger: only exact "bot"
    if (raw === "bot") {
      const greetings = [
        "হুম? বলো 😺", "Bolo baby 💬", "শুনছি বেবি 😘", "এতো ডেকো না, প্রেমে পরে যাবো 🙈", "Boss বল boss😼"
      ];
      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];

      const mention = {
        body: `╭──────•◈•──────╮\n   Hᴇʏ Xᴀɴ I’ᴍ Mᴀʀɪᴀ Bᴀʙʏ✨\n\n ❄ Dᴇᴀʀ, ${senderName}\n 💌 ${randomReply}\n╰──────•◈•──────╯`,
        mentions: [{ tag: `@${senderName}`, id: senderID }]
      };

      return api.sendMessage(mention, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "simsimi"
          });
        }
      });
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage(`| Error in handleEvent: ${err.message}`, event.threadID, event.messageID);
  }
};
