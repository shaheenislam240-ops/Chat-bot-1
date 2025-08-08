const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "prefix",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Rx Modified",
  description: "Show bot & group prefix info without using any prefix",
  commandCategory: "system",
  usages: "",
  cooldowns: 5,
  usePrefix: false
};

module.exports.handleEvent = async function ({ api, event, threadsData }) {
  const { threadID, messageID, body, timestamp } = event;
  if (!body) return;

  if (body.toLowerCase().trim() === "prefix") {
    const ping = Date.now() - timestamp;
    const day = moment.tz("Asia/Dhaka").format("dddd");
    const BOTPREFIX = global.config.PREFIX || "!";
    const BOTNAME = global.config.BOTNAME || "ʀx ᴄʜᴀᴛ ʙᴏᴛ";

    // Get group prefix dynamically
    const threadData = await threadsData.get(threadID);
    const GROUPPREFIX = threadData?.prefix || BOTPREFIX;

    const msg =
`◇───✦ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗦𝗧𝗔𝗧𝗨𝗦 ✦───◇
• 𝗣𝗶𝗻𝗴: ${ping}ms
• 𝗗𝗮𝘆: ${day}
• 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${BOTNAME}
• 𝗕𝗼𝘁 𝗣𝗿𝗲𝗳𝗶𝘅: ${BOTPREFIX}
• 𝗚𝗿𝗼𝘂𝗽 𝗣𝗿𝗲𝗳𝗶𝘅: ${GROUPPREFIX}
◇────────────────◇`;

    const imgPath = path.join(__dirname, "noprefix", "abdullah.png");

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imgPath)
    }, threadID, messageID);
  }
};

module.exports.run = async () => {};
