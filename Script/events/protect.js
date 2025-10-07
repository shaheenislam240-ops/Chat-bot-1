const fs = require("fs");
const path = require("path");

const protectFile = path.join(__dirname, "rx", "protect.json"); // তোমার JSON path

module.exports.config = {
  name: "protect",
  eventType: ["log:thread-name"], // শুধু নাম
  version: "1.0.0",
  credits: "rX Abdullah",
  description: "Only restore group name if non-admin changes it"
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

    // যদি এই গ্রুপ protect.json-এ না থাকে → কিছু হবে না
    if (!protect[threadID]) return;

    const info = protect[threadID];
    const threadInfo = await api.getThreadInfo(threadID);

    // চেক করো author অ্যাডমিন কি না
    const isAdmin = threadInfo.adminIDs.some(adm => adm.id == event.author);
    if (isAdmin) return; // অ্যাডমিন হলে কিছু হবে না

    // ❌ Non-admin → আগের নাম restore করো
    if (event.logMessageType === "log:thread-name") {
      await api.setTitle(info.name, threadID);
      await api.sendMessage(
        `⚠️ Non-admin [${event.author}] tried to change group name.\nRestored: ${info.name}`,
        threadID
      );
    }

  } catch (err) {
    console.error("[Protect Error]", err);
  }
};
