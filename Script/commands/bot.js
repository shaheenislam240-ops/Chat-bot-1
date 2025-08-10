const axios = require("axios");

const githubBaseApiUrl = "https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json";

let lastBotMessageID = {}; // থ্রেড অনুযায়ী বটের ফ্রেম মেসেজ আইডি ধরে রাখবে

module.exports.config = {
  name: "bot",
  version: "1.0.9",
  hasPermssion: 0,
  credits: "Modified by rX",
  description: "Maria Baby-style reply system (frame message + reply handling)",
  commandCategory: "noprefix",
  usages: "bot",
  cooldowns: 3
};

module.exports.handleEvent = async function({ api, event, Users }) {
  try {
    const { threadID, messageID, body, senderID, messageReply } = event;
    if (!body) return;

    const baseApi = await axios.get(githubBaseApiUrl);
    if (!baseApi.data.maria) return;
    const mariaApiUrl = baseApi.data.maria;

    const name = await Users.getNameUser(senderID);

    // Step 1: "bot" শব্দ থাকলে ফ্রেম মেসেজ পাঠাও
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

      const frameMessage =
`╭──────•◈•──────╮
   Hᴇʏ Xᴀɴ I’ᴍ Mᴀʀɪᴀ Bᴀʙʏ✨   

 ❄Dᴇᴀʀ, ${name}
 💌 ${randReply}

╰──────•◈•──────╯`;

      return api.sendMessage(frameMessage, threadID, (err, info) => {
        if (!err && info.messageID) {
          lastBotMessageID[threadID] = info.messageID; // এই মেসেজের আইডি ধরে রাখো
        }
      }, messageID);
    }

    // Step 2: যদি ইউজার রিপ্লাই করে এবং রিপ্লাই করা মেসেজ বটের ফ্রেম মেসেজ হয়
    if (messageReply && messageReply.messageID === lastBotMessageID[threadID]) {
      // Maria API থেকে রেসপন্স নাও
      const replyData = await axios.get(mariaApiUrl, {
        params: { text: body, lang: "bn" }
      });
      const botReply = replyData.data.reply || "❌ কোন রেপ্লাই পাওয়া যায়নি";

      // সরাসরি reply হিসেবে পাঠাও
      return api.sendMessage(botReply, threadID, messageID);
    }

  } catch (err) {
    console.error("obot handleEvent error:", err);
  }
};

module.exports.run = () => {};
