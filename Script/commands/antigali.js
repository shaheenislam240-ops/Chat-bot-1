// modules/commands/antigali-cmd.js
const antigali = require("../events/antigali");

module.exports.config = {
  name: "antigali",
  version: "1.0",
  hasPermssion: 1, // admin only
  credits: "Rx Abdullah",
  description: "Turn Anti-Gali ON or OFF",
  commandCategory: "moderation",
  usages: "!antigali on / !antigali off",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID } = event;

  if (!args[0]) return api.sendMessage("Usage: !antigali on / !antigali off", threadID);

  if (args[0].toLowerCase() === "on") {
    antigali.setStatus(true);
    return api.sendMessage("✅ Anti-Gali system is now **ON**", threadID);
  }

  if (args[0].toLowerCase() === "off") {
    antigali.setStatus(false);
    return api.sendMessage("❌ Anti-Gali system is now **OFF**", threadID);
  }

  return api.sendMessage("Usage: !antigali on / !antigali off", threadID);
};
