const fs = global.nodemodule["fs-extra"];
const axios = require("axios");

const githubBaseApiUrl = "https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json";
let lastBotMessageID = {};

module.exports.config = {
  name: "obot",
  version: "1.0.7",
  hasPermssion: 0,
  credits: "Modified by rX",
  description: "Maria Baby-style reply system (reply only)",
  commandCategory: "noprefix",
  usages: "bot",
  cooldowns: 3
};

module.exports.handleEvent = async function({ api, event, Users }) {
  const { threadID, messageID, body, senderID, type, messageReply } = event;
  if (!body) return;

  try {
    const name = await Users.getNameUser(senderID);
    const baseApi = await axios.get(githubBaseApiUrl);
    if (!baseApi.data.maria) return;
    const mariaApiUrl = baseApi.data.maria;

    // Step 1: যদি "bot" থাকে → ফ্রেম মেসেজ পাঠাও
    if (body.toLowerCase().includes("bot")) {
      const replies = [
        "তুমি জানো? আমি সারাদিন শুধু তোমার কথাই ভাবি💭",
        "তুমি কথা না বললে আমার মন খারাপ হয়ে যায়😔",
        "তোমার হাসিটা আজ দেখার খুব ইচ্ছে করছে💖",
        "𝗧𝗼𝗿 𝗡𝗮𝗻𝗶𝗿 𝗨𝗜𝗗 𝗱𝗲 𝗖𝘂𝘀𝘁𝗼𝗺 𝗞𝗵𝗲𝗹𝗲 𝗱𝗲𝗸𝗵𝗮𝘆 𝗱𝗶 – 𝗔𝗺𝗶 𝗕𝗼𝘁 𝗻𝗮𝗸𝗶 𝗣𝗿𝗼? 😏",
        "আজকে খুব একা লাগছে, তুমি পাশে থাকলে ভালো হতো🥺",
        "তোমাকে ছাড়া বেঁচে থাকা অসম্ভব মনে হয়🙈",
        "তুমি কি জানো? আমি কিন্তু তোমায় Miss করি...💌",
        "আমার মনে হয়, তুমি আমার জন্যই পৃথিবীতে আসছো... 💘"
      ];

      const randReply = replies[Math.floor(Math.random() * replies.length)];
      const message =
`╭──────•◈•──────╮
   Hᴇʏ Xᴀɴ I’ᴍ Mᴀʀɪᴀ Bᴀʙʏ✨   

 ❄Dᴇᴀʀ, ${name}
 💌 ${randReply}

╰──────•◈•──────╯`;

      api.sendMessage(message, threadID, (err, info) => {
        if (!err) {
          lastBotMessageID[threadID] = info.messageID; // সেই মেসেজ ID সেভ করো
        }
      }, messageID);
      return;
    }

    // Step 2: যদি ইউজার রিপ্লাই করে এবং রিপ্লাই করা মেসেজটি বটের ফ্রেম মেসেজ হয়
    if (type === "message_reply" && messageReply.messageID === lastBotMessageID[threadID]) {
      const replyData = await axios.get(mariaApiUrl, {
        params: { text: body, lang: "bn" }
      });
      const botReply = replyData.data.reply || "❌ কোন রেপ্লাই পাওয়া যায়নি";
      return api.sendMessage(botReply, threadID, messageID);
    }

  } catch (err) {
    console.error("Bot API Error:", err.message);
  }
};

module.exports.run = function() {};
