const fs = require("fs");
const path = __dirname + "/cache/autoadd.json";

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

module.exports.config = {
  name: "autoadd",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Auto re-add user when they leave the group",
  commandCategory: "group",
  usages: "[on/off]",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  const data = JSON.parse(fs.readFileSync(path));
  const threadID = event.threadID;

  if (event.logMessageType === "log:unsubscribe" && data[threadID] === true) {
    const leftUID = event.logMessageData?.leftParticipantFbId;
    if (leftUID && leftUID !== api.getCurrentUserID()) {
      try {
        await api.addUserToGroup(leftUID, threadID);
      } catch (err) {
        console.log("[AutoAdd Error]:", err.message);
      }
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  const threadInfo = await api.getThreadInfo(threadID);
  if (!threadInfo.adminIDs.some(e => e.id === api.getCurrentUserID())) {
    return api.sendMessage("⚠️ বট এই গ্রুপের এডমিন না, তাই AutoAdd কাজ করবে না।", threadID);
  }

  // Only bot admin can toggle this
  if (senderID !== api.getCurrentUserID()) {
    return api.sendMessage("❌ এই কমান্ড শুধু বট এডমিন দিতে পারবে।", threadID);
  }

  const data = JSON.parse(fs.readFileSync(path));
  const input = args[0];

  if (input === "on") {
    data[threadID] = true;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return api.sendMessage("✅ AutoAdd চালু হয়েছে। কেউ লিভ করলে তাকে আবার অ্যাড করা হবে।", threadID);
  } else if (input === "off") {
    data[threadID] = false;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return api.sendMessage("❌ AutoAdd বন্ধ করা হয়েছে।", threadID);
  } else {
    return api.sendMessage("ℹ️ ব্যবহার:\n!autoadd on\n!autoadd off", threadID);
  }
};
