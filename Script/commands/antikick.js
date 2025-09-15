const fs = require("fs");
const path = __dirname + "/catch/antikick.json";

// create storage file if not exists
if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");

let antikickData = JSON.parse(fs.readFileSync(path));

function saveData() {
  fs.writeFileSync(path, JSON.stringify(antikickData, null, 2));
}

module.exports.config = {
  name: "antikick",
  version: "1.0.5",
  hasPermssion: 1,
  credits: "Rx Abdullah",
  description: "Auto kick anyone who sends a message in this group except admins",
  commandCategory: "group",
  usages: "[on/off]",
  cooldowns: 2
};

// handle every message
module.exports.handleEvent = async function({ api, event, Threads }) {
  try {
    const threadID = event.threadID;
    const senderID = event.senderID;

    // check if antikick is enabled for this group
    if (!antikickData[threadID]) return;
    if (antikickData[threadID] === false) return;

    const dataThread = await Threads.getData(threadID);
    const threadInfo = dataThread.threadInfo;

    // skip if sender is admin
    const isAdmin = threadInfo.adminIDs.some(i => i.id == senderID);
    if (isAdmin) return;

    // skip if sender is bot
    if (senderID == api.getCurrentUserID()) return;

    // kick user with 3 sec delay
    setTimeout(() => {
      api.removeUserFromGroup(senderID, threadID);
    }, 3000);

  } catch (e) {
    console.log("Antikick error:", e);
  }
};

// command to enable/disable antikick per group
module.exports.run = async function({ api, event, args, Threads }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  const dataThread = await Threads.getData(threadID);
  const isAdmin = dataThread.threadInfo.adminIDs.some(i => i.id == senderID);

  if (!isAdmin && senderID != global.config.ADMINBOT) {
    return api.sendMessage("❌ Only Group Admin or Bot Admin can use this command.", threadID, event.messageID);
  }

  if (args[0] === "on") {
    antikickData[threadID] = true;
    saveData();
    return api.sendMessage("✅ Antikick ENABLED in this group.", threadID, event.messageID);
  } else if (args[0] === "off") {
    antikickData[threadID] = false;
    saveData();
    return api.sendMessage("❎ Antikick DISABLED in this group.", threadID, event.messageID);
  } else {
    return api.sendMessage("⚙️ Usage: !antikick [on/off]", threadID, event.messageID);
  }
};
