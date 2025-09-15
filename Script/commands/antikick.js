const fs = require("fs");
const path = __dirname + "/cache/antikick.json";

// create storage file if not exists
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

let antikickData = JSON.parse(fs.readFileSync(path));

function saveData() {
  fs.writeFileSync(path, JSON.stringify(antikickData, null, 2));
}

module.exports.config = {
  name: "antikick",
  version: "1.0.1",
  role: 1,
  hasPermssion: 1,
  credits: "Rx Abdullah",
  description: "Auto kick anyone who sends a message in this group",
  commandCategory: "group",
  usages: "[on/off]",
  cooldowns: 2
};

module.exports.handleEvent = async function({ api, event }) {
  try {
    const threadID = event.threadID;
    if (!antikickData[threadID]) return; 
    if (antikickData[threadID] === false) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(i => i.id == event.senderID);

    if (isAdmin) return; 
    if (event.senderID == api.getCurrentUserID()) return; 

    // kick the member
    return api.removeUserFromGroup(event.senderID, threadID);
  } catch (e) {
    console.log(e);
  }
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  const threadInfo = await api.getThreadInfo(threadID);
  const isAdmin = threadInfo.adminIDs.some(i => i.id == senderID);

  if (!isAdmin && senderID != global.config.ADMINBOT) {
    return api.sendMessage("❌ Only Group Admin or Bot Admin can use this command.", threadID, event.messageID);
  }

  if (args[0] === "on") {
    antikickData[threadID] = true;
    saveData();
    return api.sendMessage("✅ Antikick system is now ENABLED for this group.", threadID, event.messageID);
  } else if (args[0] === "off") {
    antikickData[threadID] = false;
    saveData();
    return api.sendMessage("❎ Antikick system is now DISABLED for this group.", threadID, event.messageID);
  } else {
    return api.sendMessage("⚙️ Usage: !antikick [on/off]", threadID, event.messageID);
  }
};
