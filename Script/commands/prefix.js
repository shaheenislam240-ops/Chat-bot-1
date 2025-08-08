const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "prefix",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Rx Modified",
  description: "Show bot prefix info without using any prefix",
  commandCategory: "system",
  usages: "",
  cooldowns: 5,
  usePrefix: false
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  if (body.toLowerCase().trim() === "prefix") {
    const ping = Date.now() - (event.timestamp || event.messageTimestamp || Date.now());
    const day = moment.tz("Asia/Dhaka").format("dddd");

    // Bot Name & Bot Prefix detect
    const BOTNAME = global.config.BOTNAME || "ʀx ᴄʜᴀᴛ ʙᴏᴛ";
    const BOTPREFIX = global.config.PREFIX || "!";

    // Group Prefix detect
    let GROUPPREFIX = BOTPREFIX;
    if (global.data && global.data.threadData && global.data.threadData.get(threadID)?.PREFIX) {
      GROUPPREFIX = global.data.threadData.get(threadID).PREFIX;
    }

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
