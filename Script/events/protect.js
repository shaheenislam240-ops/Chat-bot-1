const fs = require("fs");
const path = require("path");

const protectFile = path.join(__dirname, "rx", "protect.json"); // protect.json

module.exports.config = {
  name: "protect",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
  version: "2.5.0",
  credits: "rX Abdullah",
  description: "Group Name, Emoji & Photo protection only"
};

// 🔒 Load JSON
function loadProtect() {
  if (!fs.existsSync(protectFile)) return {};
  return JSON.parse(fs.readFileSync(protectFile));
}

// ⚙️ Event handler
module.exports.runEvent = async function({ event, api }) {
  try {
    const protect = loadProtect();
    const threadID = event.threadID;

    // যদি এই গ্রুপ protect.json এ না থাকে → ignore
    if (!protect[threadID]) return;

    const info = protect[threadID];
    const threadInfo = await api.getThreadInfo(threadID);

    // চেক করো author admin কি না
    const isAdmin = threadInfo.adminIDs.some(adm => adm.id == event.author);
    if (isAdmin) return; // অ্যাডমিন হলে কিছু হবে না

    // ❌ Non-admin → রিস্টোর করো
    if (event.logMessageType === "log:thread-name") {
      await api.setTitle(info.name, threadID);
      await api.sendMessage(`⚠️ Non-admin [${event.author}] tried to change group name\nRestored: ${info.name}`, threadID);
    }
    else if (event.logMessageType === "log:thread-icon") {
      if (info.emoji) await api.changeThreadEmoji(info.emoji, threadID);
      await api.sendMessage("⚠️ ইমোজি পরিবর্তন অনুমোদিত নয়! 🩷 This group is protected", threadID);
    }
    else if (event.logMessageType === "log:thread-image") {
      const pathImg = path.join(__dirname, "rx", "cache", threadID + ".png");
      if (fs.existsSync(pathImg)) {
        await api.changeGroupImage(fs.createReadStream(pathImg), threadID);
      }
      await api.sendMessage("⚠️ গ্রুপ ছবির পরিবর্তন অনুমোদিত নয়! 🩷 This group is protected", threadID);
    }

  } catch (err) {
    console.error("[Protect Error]", err);
  }
};
