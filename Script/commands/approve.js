const fs = require("fs");
const pathPending = __dirname + "/../../includes/pending.json";
const pathApproved = __dirname + "/../../includes/approved.json";

module.exports.config = {
  name: "approve",
  version: "1.0",
  hasPermssion: 2,
  credits: "rX",
  description: "Approve a group to enable bot",
  commandCategory: "admin",
  usages: "!approve <groupID>",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const id = args[0];
  if (!id) return api.sendMessage("⚠️ Please provide group ID", event.threadID);

  const pending = JSON.parse(fs.readFileSync(pathPending));
  const approved = JSON.parse(fs.readFileSync(pathApproved));

  const group = pending.find(g => g.id === id);
  if (!group) return api.sendMessage("❌ Group ID not found in pending list!", event.threadID);

  approved.push({ id: group.id, name: group.name });
  fs.writeFileSync(pathApproved, JSON.stringify(approved, null, 2));

  const updatedPending = pending.filter(g => g.id !== id);
  fs.writeFileSync(pathPending, JSON.stringify(updatedPending, null, 2));

  api.sendMessage(
    `✅ Group "${group.name}" approved successfully!\nApproved by: rX Abdullah`,
    id
  );

  api.sendMessage(`✅ Approved group "${group.name}"!`, event.threadID);
};
