const moment = require("moment-timezone");
const path = require("path");

module.exports = {
  name: "prefix",
  alias: [],
  description: "Show bot prefix info without using any prefix",
  usage: "prefix",
  permissions: [],
  cooldown: 5,
  match: "exact", // exact match for message
  async execute(mirai, message) {
    const { content, time, group } = message;

    if (content.toLowerCase().trim() !== "prefix") return false; // extra safety

    const ping = Date.now() - time;
    const day = moment.tz("Asia/Dhaka").format("dddd");

    // Adjust these as per your config or environment
    const botPrefix = "!";
    const groupPrefix = botPrefix; // if you have group specific prefix, get from group config

    const botName = mirai.botInfo.nick || "ʀx ᴄʜᴀᴛ ʙᴏᴛ";

    const replyText =
`◇───✦ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗦𝗧𝗔𝗧𝗨𝗦 ✦───◇
• 𝗣𝗶𝗻𝗴: ${ping}ms
• 𝗗𝗮𝘆: ${day}
• 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${botName}
• 𝗕𝗼𝘁 𝗣𝗿𝗲𝗳𝗶𝘅: ${botPrefix}
• 𝗚𝗿𝗼𝘂𝗽 𝗣𝗿𝗲𝗳𝗶𝘅: ${groupPrefix}
◇────────────────◇`;

    // send text reply
    await message.reply(replyText);

    // send image - adjust path to your image
    const imgPath = path.join(__dirname, "noprefix", "abdullah.png");
    await message.replyImage(imgPath);

    return true; // indicate command handled
  }
};
