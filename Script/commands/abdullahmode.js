const axios = require("axios");
const fs = require("fs");
const request = require("request");

const link = [
  "https://i.imgur.com/8tJ70qr.mp4",
];

module.exports.config = {
  name: "abdullahmode",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Islamick Chat",
  description: "auto reply when someone mentions abdullah",
  commandCategory: "noprefix",
  usages: "abdullah",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.handleEvent = async ({ api, event, Threads }) => {
  const content = event.body || '';
  const body = content.toLowerCase();

  // ✅ Check if feature is off
  const threadData = await Threads.getData(event.threadID);
  const data = threadData.data || {};
  if (data["abdullah"] === false) return;

  // ✅ Trigger if someone mentions 'abdullah' anywhere in the message
  if (body.includes("abdullah")) {
    const rahad = [
      `★彡🌙⛧∘₊˚⋆ 𝑨𝑩𝑫𝑼𝐋𝐋𝐀𝐇 𝑴𝑶𝑫𝑬 ∘₊˚⋆⛧🌙彡★

⚡ ᴘᴏᴡᴇʀ ʟᴇᴠᴇʟ: 9999%

｡･ﾟﾟ･　★　･ﾟﾟ･｡
🌟 Sᴜᴘᴇʀ Sᴀɪʏᴀɴ Mᴏᴅᴇ Aᴄᴛɪᴠᴀᴛᴇᴅ 🌟
｡･ﾟﾟ･　★　･ﾟﾟ･｡

༺🌙 𝐑𝐗 𝐀𝐁𝐃𝐔𝐋𝐋𝐀𝐇 𝐁𝐎𝐒𝐒 𝐎𝐅 𝐁𝐎𝐒𝐒𝐄𝐒 🌙༻`
    ];

    const rahad2 = rahad[Math.floor(Math.random() * rahad.length)];

    const callback = () => api.sendMessage({
      body: rahad2,
      attachment: fs.createReadStream(__dirname + "/cache/2024.mp4")
    }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/2024.mp4"), event.messageID);

    const requestStream = request(encodeURI(link[Math.floor(Math.random() * link.length)]));
    requestStream.pipe(fs.createWriteStream(__dirname + "/cache/2024.mp4")).on("close", callback);
    return requestStream;
  }
};

module.exports.languages = {
  "vi": {
    "on": "Dùng sai cách rồi lêu lêu",
    "off": "sv ngu, đã bão dùng sai cách",
    "successText": `🧠`,
  },
  "en": {
    "on": "on",
    "off": "off",
    "successText": "success!",
  }
};

module.exports.run = async ({ api, event, Threads, getText }) => {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data || {};
  if (typeof data["abdullah"] === "undefined" || data["abdullah"] === true) data["abdullah"] = false;
  else data["abdullah"] = true;
  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);
  api.sendMessage(`${(data["abdullah"]) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
};
