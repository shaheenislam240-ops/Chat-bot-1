const fs = require("fs");
const path = require("path");

// 🔹 JSON location → event/rx/protect.json
const protectFile = path.join(__dirname, "rx", "protect.json");

module.exports.config = {
  name: "protect",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
  version: "2.3.3",
  credits: "rX Abdullah", // don't change my credit
  description: "Manual group protection (𝐌𝐚𝐫𝐢𝐚 × 𝐫𝐗 𝐂𝐡𝐚𝐭𝐛𝐨𝐭)"
};

// 🔒 Load JSON
function loadProtect() {
  if (!fs.existsSync(protectFile)) fs.writeFileSync(protectFile, JSON.stringify({}, null, 4));
  return JSON.parse(fs.readFileSync(protectFile));
}

// 🔒 Save JSON
function saveProtect(data) {
  fs.writeFileSync(protectFile, JSON.stringify(data, null, 4));
}

// 🚫 আর group info auto-save হবে না
module.exports.run = async function() {
  console.log("🛡️ Protect system active (manual mode).");
};

// ⚙️ Protect event
module.exports.runEvent = async function({ event, api }) {
  try {
    const protect = loadProtect();
    const threadID = event.threadID;

    // JSON-এ group data না থাকলে কিছু করবে না
    if (!protect[threadID]) return;

    const info = protect[threadID];
    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(adm => adm.id == event.author);

    // ✅ Admin পরিবর্তন অনুমোদিত
    if (isAdmin) return;

    // ❌ Non-admin পরিবর্তন → restore
    if (event.logMessageType === "log:thread-name") {
      await api.setTitle(info.name, threadID);
      api.sendMessage(`⚠️ Non-admin [${event.author}] tried to change group name\nRestored: ${info.name}`, threadID);
    }
    else if (event.logMessageType === "log:thread-icon") {
      await api.changeThreadEmoji(info.emoji, threadID);
      api.sendMessage("⚠️ ইমোজি পরিবর্তন অনুমোদিত নয়!\n🩷 This group is protected", threadID);
    }
    else if (event.logMessageType === "log:thread-image") {
      const pathImg = path.join(__dirname, "rx", "cache", threadID + ".png"); // rx/cache
      if (fs.existsSync(pathImg)) {
        await api.changeGroupImage(fs.createReadStream(pathImg), threadID);
      }
      api.sendMessage("⚠️ গ্রুপ ছবির পরিবর্তন অনুমোদিত নয়!\n🩷 This group is protected by rX Chat bot", threadID);
    }

  } catch (err) {
    console.error("[Maria Protect Error]", err);
  }
};
