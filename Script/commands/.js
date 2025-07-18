const axios = require("axios");
const fs = require("fs");
const request = require("request");

const link = [
  "https://i.imgur.com/kKYsCkX.mp4",
  "https://i.imgur.com/MvjfMcQ.mp4",
  "https://i.imgur.com/vgQeoyZ.mp4"
];

module.exports.config = {
  name: "🥺",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Islamick Chat + RX Abdullah",
  description: "auto reply to 🥺 with text and video",
  commandCategory: "noprefix",
  usages: "🥺",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.handleEvent = async ({ api, event, Threads }) => {
  const content = event.body ? event.body : '';
  const body = content.toLowerCase();

  if (body.startsWith("🥺")) {
    const texts = [
      "╭•┄┅════❁🌺❁════┅┄•╮\n\nআমি তাকে সারবার জন্য ভালোবাসি নি 🥺\n\n╰•┄┅════❁🌺❁════┅┄•╯",
      "╭•┄┅════❁🌺❁════┅┄•╮\n\nসে জে আমার রক্তে মিসে আছে-!!🥺\n\n╰•┄┅════❁🌺❁════┅┄•╯"
    ];

    const randomText = texts[Math.floor(Math.random() * texts.length)];
    const randomVideo = link[Math.floor(Math.random() * link.length)];

    const filePath = __dirname + "/cache/🥺.mp4";
    const callback = () => api.sendMessage({
      body: randomText,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

    const requestStream = request(encodeURI(randomVideo));
    requestStream.pipe(fs.createWriteStream(filePath)).on("close", callback);
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
  let data = (await Threads.getData(threadID)).data;
  if (typeof data["🥺"] === "undefined" || data["🥺"]) data["🥺"] = false;
  else data["🥺"] = true;
  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);
  api.sendMessage(`${(data["🥺"]) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
};
