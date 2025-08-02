const fs = require("fs");
const path = __dirname + "/cache/autoadd.json";

module.exports.config = {
  name: "autoadd",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Only bot owner can turn on/off auto-add system",
  commandCategory: "admin",
  usages: "!autoadd on / off",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  // Only this UID can use the command
  const botAdminUID = "100068565380737";

  if (senderID !== botAdminUID) {
    return api.sendMessage("❌ শুধু rX Abdullah এই কমান্ডটি ব্যবহার করতে পারবে।", threadID, event.messageID);
  }

  if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));
  let data = JSON.parse(fs.readFileSync(path));

  if (args[0] === "on") {
    data[threadID] = true;
    api.sendMessage("✅ AutoAdd সিস্টেম চালু হয়েছে। কেউ গ্রুপ ছাড়লে আবার অটো অ্যাড হবে।", threadID);
  } else if (args[0] === "off") {
    delete data[threadID];
    api.sendMessage("❌ AutoAdd সিস্টেম বন্ধ করা হয়েছে।", threadID);
  } else {
    api.sendMessage("ℹ️ ব্যবহার: !autoadd on / off", threadID);
  }

  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};
