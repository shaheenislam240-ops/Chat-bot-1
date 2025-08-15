const fs = global.nodemodule["fs-extra"];

module.exports.config = {
  name: "obot",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "Modified by rX",
  description: "Maria Baby-style reply system (only exact 'bot' trigger)",
  commandCategory: "noprefix",
  usages: "bot",
  cooldowns: 3
};

module.exports.handleEvent = async function({ api, event, Users }) {
  const { threadID, messageID, body, senderID } = event;
  
  // no text or not exactly "bot" => ignore
  if (!body) return;
  if (body.trim().toLowerCase() !== "bot") return;

  const name = await Users.getNameUser(senderID);

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

 ❄ Dᴇᴀʀ, ${name}
 💌 ${randReply}

╰──────•◈•──────╯`;

  return api.sendMessage(message, threadID, messageID);
};

module.exports.run = function() {};
