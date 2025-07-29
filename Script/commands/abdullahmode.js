const axios = require("axios");
const fs = require("fs");
const request = require("request");

const link = [
  "https://i.imgur.com/bbigbCj.mp4" // এখানে চাইলে আরো ভিডিও লিংক যোগ করতে পারিস
];

module.exports.config = {
  name: "abdullahmode",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Send video when 'abdullah' keyword detected",
  commandCategory: "auto",
  usages: "noprefix",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.handleEvent = async ({ api, event }) => {
  const content = event.body ? event.body.toLowerCase() : '';
  if (content.includes("abdullah")) {

    const title = `★彡🌙⛧∘₊˚⋆ 𝑨𝑩𝑫𝑼𝑳𝐋𝐀𝐇 𝑴𝑶𝑫𝑬 ∘₊˚⋆⛧🌙彡★

⚡ ᴘᴏᴡᴇʀ ʟᴇᴠᴇʟ: 9999%

｡･ﾟﾟ･　★　･ﾟﾟ･｡
🌟 Sᴜᴘᴇʀ Sᴀɪʏᴀɴ Mᴏᴅᴇ Aᴄᴛɪᴠᴀᴛᴇᴅ 🌟
｡･ﾟﾟ･　★　･ﾟﾟ･｡

༺🌙 𝐑𝐗 𝐀𝐁𝐃𝐔𝐋𝐋𝐀𝐇 𝐁𝐎𝐒𝐒 𝐎𝐅 𝐁𝐎𝐒𝐒𝐄𝐒 🌙༻`;

    const callback = () => api.sendMessage({
      body: title,
      attachment: fs.createReadStream(__dirname + "/cache/abdullahmode.mp4")
    }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/abdullahmode.mp4"), event.messageID);

    const videoUrl = link[Math.floor(Math.random() * link.length)];
    const requestStream = request(encodeURI(videoUrl));
    requestStream.pipe(fs.createWriteStream(__dirname + "/cache/abdullahmode.mp4")).on("close", () => callback());

    return requestStream;
  }
};

module.exports.run = () => {};
