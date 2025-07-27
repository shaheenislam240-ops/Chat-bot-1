const fs = require("fs");
const path = __dirname + "/cache/approvedThreads.json";
const pendingPath = __dirname + "/cache/pendingThreads.json";

module.exports.config = {
  name: "autocheck",
  version: "1.0.0",
  credits: "RX Abdullah",
  description: "Block bot in unapproved groups",
  eventType: ["message", "message_reply"],
};

module.exports.handleEvent = function ({ event, api }) {
  const { threadID, senderID } = event;
  const approved = JSON.parse(fs.readFileSync(path));
  const pending = JSON.parse(fs.readFileSync(pendingPath));

  if (!approved.includes(threadID)) {
    if (!pending.includes(threadID)) {
      pending.push(threadID);
      fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
    }
    return api.sendMessage(`🛑 এই গ্রুপে বট চালাতে হলে অনুমোদন লাগবে।
অনুমোদনের জন্য যোগাযোগ করুন: m.me/rxabdullah007`, threadID);
  }
};
