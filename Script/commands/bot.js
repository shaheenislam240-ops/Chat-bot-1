const axios = require("axios");

const githubBaseApiUrl = "https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json";
let activeChats = {};

module.exports.config = {
  name: "bot",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "Modified by rX",
  description: "Maria Baby-style API chat system",
  commandCategory: "noprefix",
  usages: "bot",
  cooldowns: 3
};

module.exports.handleEvent = async function({ api, event, Users }) {
  const { threadID, messageID, body, senderID } = event;
  if (!body) return;

  try {
    const name = await Users.getNameUser(senderID);
    const baseApi = await axios.get(githubBaseApiUrl);
    if (!baseApi.data.maria) return;
    const mariaApiUrl = baseApi.data.maria;

    if (body.toLowerCase() === "bot") {
      activeChats[threadID] = true;
      const replyData = await axios.get(mariaApiUrl, {
        params: { text: body, lang: "bn" }
      });
      const botReply = replyData.data.reply || "❌ কোন রেপ্লাই পাওয়া যায়নি";

      const message =
`╭──────•◈•──────╮
   Hᴇʏ Xᴀɴ I’ᴍ Mᴀʀɪᴀ Bᴀʙʏ✨   

 ❄Dᴇᴀʀ, ${name}
 💌 ${botReply}

╰──────•◈•──────╯`;

      return api.sendMessage(message, threadID, messageID);
    }

    if (activeChats[threadID]) {
      const replyData = await axios.get(mariaApiUrl, {
        params: { text: body, lang: "bn" }
      });
      const botReply = replyData.data.reply || "❌ কোন রেপ্লাই পাওয়া যায়নি";
      return api.sendMessage(botReply, threadID, messageID);
    }

  } catch (err) {
    console.error("OBot API Error:", err.message);
  }
};

module.exports.run = function() {};
