const moment = require("moment-timezone");

module.exports.config = {
  name: "prefix",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rx Modified",
  description: "Show bot prefix info without using any prefix",
  commandCategory: "system",
  usages: "",
  cooldowns: 5,
  usePrefix: false // ⭐⭐ Main part: no prefix needed
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  if (body.toLowerCase().trim() === "prefix") {
    const ping = Date.now() - event.timestamp;
    const day = moment.tz("Asia/Dhaka").format("dddd");
    const PREFIX = global.config.PREFIX || "!";
    const BOTNAME = global.config.BOTNAME || "ʀx ᴄʜᴀᴛ ʙᴏᴛ";

    const msg =
`╔══════𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢════╗

┃ ✴ 𝗣𝗶𝗻𝗴: ${ping}ms
┃ 🗓️ ${day}
┃ ✪ 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${BOTNAME}
┃ ❁ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗣𝗿𝗲𝗳𝗶𝘅: ${PREFIX}

╚═════════════════════╝`;

    return api.sendMessage(msg, threadID, messageID);
  }
};

module.exports.run = async () => {};
