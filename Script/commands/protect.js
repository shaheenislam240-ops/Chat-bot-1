// commands/protect.js
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
  name: "protect",
  version: "1.0.1",
  hasPermssion: 1,
  credits: "rX Abdullah",
  description: "Turn ON/OFF the protect system",
  usages: "[on/off]",
  commandCategory: "system"
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  let protect = loadProtect();

  if (!protect[threadID]) {
    protect[threadID] = { enable: false };
  }

  // কোনো argument না দিলে বর্তমান স্ট্যাটাস দেখাবে
  if (!args[0]) {
    const status = protect[threadID].enable ? "🟢 ON" : "🔴 OFF";
    return api.sendMessage(`⚙️ Protect status: ${status}`, threadID);
  }

  const input = args[0].toLowerCase();
  if (input === "on") {
    protect[threadID].enable = true;
    saveProtect(protect);
    return api.sendMessage("✅ Group protection system is now ON.", threadID);
  }

  if (input === "off") {
    protect[threadID].enable = false;
    saveProtect(protect);
    return api.sendMessage("❌ Group protection system is now OFF.", threadID);
  }

  return api.sendMessage("❓ Usage: !protect [on/off]", threadID);
};
