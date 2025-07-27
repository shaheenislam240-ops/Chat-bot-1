const fs = require("fs");
const path = __dirname + "/cache";
const approvePath = path + "/approvedThreads.json";
const pendingPath = path + "/pendingThreads.json";

if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
if (!fs.existsSync(approvePath)) fs.writeFileSync(approvePath, JSON.stringify([]));
if (!fs.existsSync(pendingPath)) fs.writeFileSync(pendingPath, JSON.stringify([]));

module.exports.config = {
  name: "approve",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "RX Abdullah",
  description: "Group approval system",
  commandCategory: "admin",
  usages: "[reply/id/l/del/p]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const approved = JSON.parse(fs.readFileSync(approvePath));
  const pending = JSON.parse(fs.readFileSync(pendingPath));
  const { threadID, messageID, messageReply } = event;

  if (args[0] === "l") {
    if (!approved.length) return api.sendMessage("📄 কোনো অ্যাপ্রুভড গ্রুপ নেই।", threadID, messageID);
    let msg = "✅ Approved Groups:\n\n";
    approved.forEach((id, i) => msg += `${i + 1}. ${id}\n`);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (args[0] === "p") {
    if (!pending.length) return api.sendMessage("📄 কোনো pending group নেই।", threadID, messageID);
    let msg = "🕐 Pending Groups:\n\n";
    pending.forEach((id, i) => msg += `${i + 1}. ${id}\n`);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (args[0] === "del") {
    const id = args[1];
    if (!approved.includes(id)) return api.sendMessage("❌ এই আইডি অ্যাপ্রুভড তালিকায় নেই।", threadID, messageID);
    const index = approved.indexOf(id);
    approved.splice(index, 1);
    fs.writeFileSync(approvePath, JSON.stringify(approved, null, 2));
    return api.sendMessage(`❌ ${id} গ্রুপটি অ্যাপ্রুভ তালিকা থেকে মুছে ফেলা হয়েছে।`, threadID, messageID);
  }

  let id;
  if (args[0]) id = args[0];
  else if (messageReply) id = messageReply.threadID;
  else id = threadID;

  if (approved.includes(id)) return api.sendMessage("✅ এই গ্রুপ ইতোমধ্যে অ্যাপ্রুভড আছে!", threadID, messageID);

  approved.push(id);
  fs.writeFileSync(approvePath, JSON.stringify(approved, null, 2));

  // remove from pending
  const pendingIndex = pending.indexOf(id);
  if (pendingIndex !== -1) {
    pending.splice(pendingIndex, 1);
    fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
  }

  return api.sendMessage(`✅ গ্রুপ ${id} সফলভাবে অ্যাপ্রুভ করা হয়েছে!`, threadID, messageID);
};
