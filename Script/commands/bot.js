const axios = require("axios");
const simsim = "https://simsimi.cyberbot.top";

module.exports.config = {
  name: "bot",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "ULLASH + rX",
  description: "Baby-style frame reply first, API reply on reply",
  commandCategory: "simsim",
  usages: "[message/query]",
  cooldowns: 0,
  prefix: false
};

module.exports.run = function() {}; // noprefix

module.exports.handleEvent = async function({ api, event, Users }) {
  try {
    const { threadID, messageID, body, senderID, type } = event;
    if (!body) return;
    const raw = body.toLowerCase().trim();
    const senderName = await Users.getNameUser(senderID);

    const triggers = ["bot"];

    // --- Case 1: exact trigger message → old frame + mention ---
    if (triggers.includes(raw)) {
      const greetings = [
        "Bolo baby 💬", "হুম? বলো 😺", "হ্যাঁ জানু 😚", "শুনছি বেবি 😘", 
        "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈", "Boss বল boss😼", 
        "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস  😉😋🤣", 
        "তোর কি চোখে পড়ে না আমি বস উল্লাস এর সাথে ব্যাস্ত আসি😒"
      ];
      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];

      const mention = {
        body: `╭──────•◈•──────╮
   Hᴇʏ Xᴀɴ I’ᴍ Mᴀʀɪᴀ Bᴀʙʏ✨   

 ❄ Dᴇᴀʀ, ${senderName}
 💌 ${randomReply}

╰──────•◈•──────╯`,
        mentions: [{ tag: senderName, id: senderID }]
      };

      return api.sendMessage(mention, threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "simsimi"
          });
        }
      }, messageID);
    }

    // --- Case 2: reply to previous bot message → API normal reply ---
    if (type === "message_reply") {
      try {
        const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(body)}&senderName=${encodeURIComponent(senderName)}`);
        const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

        for (const reply of responses) {
          await new Promise(resolve => {
            api.sendMessage(reply, threadID, (err, info) => {
              if (!err) {
                global.client.handleReply.push({
                  name: module.exports.config.name,
                  messageID: info.messageID,
                  author: senderID,
                  type: "simsimi"
                });
              }
              resolve();
            }, messageID);
          });
        }
      } catch (e) {
        return api.sendMessage("⚠️ API থেকে reply আনার সময় সমস্যা হয়েছে!", threadID, messageID);
      }
    }

    // --- Case 3: trigger + query (e.g., "bot kemon aso?") → API normal reply ---
    if (triggers.some(tr => raw.startsWith(tr + " "))) {
      const query = raw.replace(new RegExp(`^(${triggers.join("|")})\\s+`), "").trim();
      if (!query) return;

      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
      const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

      for (const reply of responses) {
        await new Promise(resolve => {
          api.sendMessage(reply, threadID, (err, info) => {
            if (!err) {
              global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: senderID,
                type: "simsimi"
              });
            }
            resolve();
          }, messageID);
        });
      }
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage(`| Error in handleEvent: ${err.message}`, event.threadID, event.messageID);
  }
};
