const fs = require("fs");
const path = __dirname + "/cache/autoadd.json";

module.exports.config = {
  name: "autoaddevent",
  eventType: ["log:unsubscribe"],
  version: "1.0.1",
  credits: "rX Abdullah",
  description: "Re-add member if they leave while autoadd is ON"
};

module.exports.run = async function({ api, event }) {
  if (!fs.existsSync(path)) return;
  let data = JSON.parse(fs.readFileSync(path));
  const threadID = event.threadID;

  if (!data[threadID]) return;

  const leftUser = event.logMessageData?.leftParticipantFbId;

  // Prevent adding the bot itself
  if (leftUser == api.getCurrentUserID()) return;

  try {
    await api.addUserToGroup(leftUser, threadID);
    api.sendMessage(`🔄 ইউজার আবার অ্যাড করা হয়েছে (UID: ${leftUser})`, threadID);
  } catch (err) {
    api.sendMessage(`⚠️ ${leftUser} কে অ্যাড করতে ব্যর্থ। হয়তো প্রাইভেসি অন আছে বা নিজে লিভ করেছে।`, threadID);
  }
};
