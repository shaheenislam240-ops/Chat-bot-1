const fs = require("fs");
const path = __dirname + "/../../approved.json";

module.exports.config = {
  name: "approve",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "RX Abdullah",
  description: "Approve or unapprove groups",
  commandCategory: "admin",
  usages: "[on/off]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const data = JSON.parse(fs.readFileSync(path));
  const groupID = event.threadID;

  if (!args[0]) return api.sendMessage("🔰 Use: approve on / off", groupID);

  if (args[0].toLowerCase() === "on") {
    if (!data.approved.includes(groupID)) {
      data.approved.push(groupID);
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("✅ This group is now approved to use the bot.", groupID);
    } else {
      return api.sendMessage("⚠️ This group is already approved.", groupID);
    }
  }

  if (args[0].toLowerCase() === "off") {
    if (data.approved.includes(groupID)) {
      data.approved = data.approved.filter(id => id !== groupID);
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("⛔ This group is now unapproved. Bot won't respond here.", groupID);
    } else {
      return api.sendMessage("⚠️ This group is already unapproved.", groupID);
    }
  }

  return api.sendMessage("❌ Invalid usage. Try: approve on / off", groupID);
};
