const axios = require("axios");
const fs = require("fs");
const request = require("request");
const path = require("path");

const link = [
  "https://i.imgur.com/8tJ70qr.mp4"
];

module.exports.config = {
  name: "abdullah",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX",
  description: "auto reply to salam",
  commandCategory: "noprefix",
  usages: "abdullah",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.handleEvent = async ({ api, event }) => {
  const content = event.body || '';
  const body = content.toLowerCase().trim();

  if (!body.includes("abdullah")) return;

  const messages = [
    "╭•┄┅════❁🌺❁════┅┄•╮\n\n🎀 𝙎𝙝𝙚 𝙞𝙨 𝙧𝙓\n\n╰•┄┅════❁🌺❁════┅┄•╯",
    "╭•┄┅════❁🌺❁════┅┄•╮\n\n𝙏𝙖𝙠𝙚 𝙨𝙤𝙗𝙖𝙞 𝘼𝙗𝙙𝙪𝙡𝙡𝙖𝙝 𝙣𝙖𝙢𝙚 𝙖 𝙘𝙝𝙞𝙣𝙚\n\n╰•┄┅════❁🌺❁════┅┄•╯"
  ];
  const messageText = messages[Math.floor(Math.random() * messages.length)];
  const videoUrl = link[Math.floor(Math.random() * link.length)];

  const filePath = path.join(__dirname, "/cache", `${event.senderID}_abdullah.mp4`);
  const file = fs.createWriteStream(filePath);

  request(videoUrl)
    .pipe(file)
    .on("finish", () => {
      api.sendMessage({
        body: messageText,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    })
    .on("error", (err) => {
      console.error("Video download error:", err);
    });
};

module.exports.run = async ({ api, event, Threads, getText }) => {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;
  if (typeof data["abdullah"] === "undefined" || data["abdullah"]) data["abdullah"] = false;
  else data["abdullah"] = true;
  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);
  api.sendMessage(`${(data["abdullah"]) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
};
