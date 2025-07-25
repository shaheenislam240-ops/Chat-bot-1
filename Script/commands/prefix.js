const moment = require("moment-timezone");

module.exports.config = {
  name: "prefix",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Modified by Rx",
  description: "Show bot prefix info",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const startTime = Date.now();

  // Timezone + Day
  const currentDay = moment.tz("Asia/Dhaka").format("dddd");

  // Global prefix and botname
  const PREFIX = global.config.PREFIX || "!";
  const BOTNAME = global.config.BOTNAME || "ʀx ᴄʜᴀᴛ ʙᴏᴛ";

  // Ping calculation
  const ping = Date.now() - startTime;

  // Final styled message
  const msg = 
`╔══════𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢════╗

┃ ✴ 𝗣𝗶𝗻𝗴: ${ping}ms
┃ 🗓️ ${currentDay}
┃ ✪ 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${BOTNAME}
┃ ❁ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗣𝗿𝗲𝗳𝗶𝘅: ${PREFIX}

╚═════════════════════╝`;

  return api.sendMessage(msg, threadID, messageID);
};
