const axios = require("axios");
const fs = global.nodemodule["fs-extra"];
const simsim = "https://simsimi.cyberbot.top";

module.exports.config = {
  name: "obot",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "Modified by rX",
  description: "Maria Baby-style reply system (only exact 'bot' trigger)",
  commandCategory: "noprefix",
  usages: "bot",
  cooldowns: 3
};

module.exports.handleEvent = async function({ api, event, Users }) {
  const { threadID, messageID, body, senderID, messageReply } = event;

  if (!body) return;

  const name = await Users.getNameUser(senderID);

  // ---- First "bot" trigger: frame + mention ----
  if (body.trim().toLowerCase() === "bot") {
    const replies = [
      "বেশি Bot Bot করলে leave নিবো কিন্তু😒",
      "🥛-🍍👈 -লে খাহ্..!😒",
      "শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নাই🥺",
      "আমি আবাল দের সাথে কথা বলি না😒",
      "এতো ডেকো না, প্রেমে পরে যাবো 🙈",
      "বার বার ডাকলে মাথা গরম হয়ে যায়😑",
      "হ্যা বলো😒, তোমার জন্য কি করতে পারি?",
      "এতো ডাকছিস কেন? গালি শুনবি নাকি? 🤬"
    ];
    const randReply = replies[Math.floor(Math.random() * replies.length)];

    const message =
`╭──────•◈•──────╮
   Hᴇʏ Xᴀɴ I’ᴍ Mᴀʀɪᴀ Bᴀʙʏ✨   

 ❄ Dᴇᴀʀ, ${name}
 💌 ${randReply}

╰──────•◈•──────╯`;

    return api.sendMessage(message, threadID, messageID);
  }

  // ---- Reply to bot message: Simsimi API ----
  if (event.messageReply && event.messageReply.senderID === api.getCurrentUserID()) {
    const replyText = body;
    if (!replyText) return;

    try {
      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(name)}`);
      const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

      for (const reply of responses) {
        await new Promise(resolve => {
          api.sendMessage(reply, threadID, (err) => {
            resolve();
          }, messageID);
        });
      }
    } catch (err) {
      console.error(err);
      return api.sendMessage(`| Error in Simsimi API: ${err.message}`, threadID, messageID);
    }
  }
};

module.exports.run = function() {};
