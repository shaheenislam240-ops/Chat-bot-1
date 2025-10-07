// events/protectEvent.js
const fs = require("fs");
const path = require("path");

const protectFile = path.join(__dirname, "../../protect.json");

function loadProtect() {
  if (!fs.existsSync(protectFile)) fs.writeFileSync(protectFile, JSON.stringify({}, null, 4));
  return JSON.parse(fs.readFileSync(protectFile));
}
function saveProtect(data) {
  fs.writeFileSync(protectFile, JSON.stringify(data, null, 4));
}

module.exports.config = {
  name: "protectEvent",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
  version: "1.0.0",
  credits: "rX Abdullah",
  description: "Auto restore name, emoji, photo if non-admin changes (Maria × rX)"
};

module.exports.run = async function ({ event, api }) {
  try {
    let protect = loadProtect();
    const threadID = event.threadID;
    const threadInfo = await api.getThreadInfo(threadID);

    // যদি group data না থাকে → add default
    if (!protect[threadID]) {
      protect[threadID] = {
        name: threadInfo.threadName || "Unknown",
        emoji: threadInfo.emoji || "💬",
        imagePath: __dirname + "/cache/" + threadID + ".png",
        enable: false
      };
      saveProtect(protect);
      return;
    }

    const info = protect[threadID];
    if (info.enable !== true) return; // 🔴 protect বন্ধ থাকলে কিছুই করবে না

    const isAdmin = threadInfo.adminIDs.some(adm => adm.id == event.author);

    // ✅ admin change করলে update নেবে
    if (isAdmin) {
      if (event.logMessageType === "log:thread-name") {
        info.name = threadInfo.threadName;
        saveProtect(protect);
      } else if (event.logMessageType === "log:thread-icon") {
        info.emoji = threadInfo.emoji;
        saveProtect(protect);
      } else if (event.logMessageType === "log:thread-image") {
        info.imagePath = __dirname + "/cache/" + threadID + ".png";
        saveProtect(protect);
      }
      return;
    }

    // ❌ Non-admin change → restore
    if (event.logMessageType === "log:thread-name") {
      await api.setTitle(info.name, threadID);
      api.sendMessage("< 🧃\n𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐧𝐨 𝐩𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐭𝐨 𝐜𝐡𝐚𝐧𝐠𝐞 (𝐏𝐫𝐨𝐭𝐞𝐜𝐭𝐞𝐝 𝐛𝐲 𝐫𝐗).", threadID);
    } else if (event.logMessageType === "log:thread-icon") {
      api.changeThreadEmoji(info.emoji, threadID);
      api.sendMessage("⚠️ Emoji change not allowed (Protected by rX).", threadID);
    } else if (event.logMessageType === "log:thread-image") {
      const img = info.imagePath;
      if (fs.existsSync(img)) {
        api.changeGroupImage(fs.createReadStream(img), threadID);
      }
      api.sendMessage("⚠️ Photo change not allowed (Protected by rX).", threadID);
    }
  } catch (e) {
    console.error("[protectEvent Error]", e);
  }
};
