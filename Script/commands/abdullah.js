const axios = require("axios");
const fs = require("fs");
const request = require("request");

const videoLinks = [
  "https://i.imgur.com/8tJ70qr.mp4"
];

module.exports.config = {
  name: "abdullah",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Maria x Rx Abdullah",
  description: "Trigger Abdullah mode",
  commandCategory: "noprefix",
  usages: "Just say abdullah",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.handleEvent = async ({ api, event, Threads }) => {
  const content = event.body ? event.body.toLowerCase() : "";
  if (!content.includes("abdullah")) return;

  const threadData = await Threads.getData(event.threadID);
  const data = threadData.data || {};
  if (data["abdullah"] === false) return; // ফিচার অফ থাকলে কাজ করবে না

  const replyText = `
★彡🌙⛧∘₊˚⋆ 𝑨𝑩𝑫𝑼𝑳𝑳𝑨𝐇 𝑴𝑶𝑫𝑬 ∘₊˚⋆⛧🌙彡★

⚡ ᴘᴏᴡᴇʀ ʟᴇᴠᴇʟ: 9999%

｡･ﾟﾟ･　★　･ﾟﾟ･｡
🌟 Sᴜᴘᴇʀ Sᴀɪʏᴀɴ Mᴏᴅᴇ Aᴄᴛɪᴠᴀᴛᴇᴅ 🌟
｡･ﾟﾟ･　★　･ﾟﾟ･｡

༺🌙 𝐑𝐗 𝐀𝐁𝐃𝐔𝐋𝐋𝐀𝐇 𝐁𝐎𝐒𝐒 𝐎𝐅 𝐁𝐎𝐒𝐒𝐄𝐒 🌙༻`;

  const videoUrl = videoLinks[Math.floor(Math.random() * videoLinks.length)];
  const filePath = __dirname + "/cache/2024.mp4";

  const callback = () => api.sendMessage({
    body: replyText,
    attachment: fs.createReadStream(filePath)
  }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

  const reqStream = request(encodeURI(videoUrl));
  reqStream.pipe(fs.createWriteStream(filePath)).on("close", callback);
};

module.exports.languages = {
  "en": {
    "on": "Abdullah mode is now OFF.",
    "off": "Abdullah mode is now ON.",
    "successText": "✓"
  }
};

module.exports.run = async ({ api, event, Threads, getText }) => {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data || {};
  if (typeof data["abdullah"] === "undefined" || data["abdullah"] === true) {
    data["abdullah"] = false;
  } else {
    data["abdullah"] = true;
  }

  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);
  api.sendMessage(`${(data["abdullah"]) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
};
