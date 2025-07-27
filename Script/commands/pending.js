const fs = require("fs");
const path = __dirname + "/../../includes/pending.json";

module.exports.config = {
  name: "pending",
  version: "1.0",
  hasPermssion: 2,
  credits: "rX",
  description: "See pending group list",
  commandCategory: "admin",
  usages: "!pending",
  cooldowns: 3
};

module.exports.run = async function({ api, event }) {
  const pending = JSON.parse(fs.readFileSync(path));
  if (!pending.length) return api.sendMessage("❌ No pending groups!", event.threadID);

  let msg = "🕒 Pending Groups:\n";
  for (const group of pending) {
    msg += `📌 Name: ${group.name}\n🆔 ID: ${group.id}\n\n`;
  }

  api.sendMessage(msg, event.threadID);
};
