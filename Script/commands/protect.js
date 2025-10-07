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
  version: "1.0.2",
  hasPermssion: 1,
  credits: "rX Abdullah",
  description: "Toggle protect system (on/off)",
  usePrefix: true,
  commandCategory: "system",
  usages: "protect on/off",
  cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const protect = loadProtect();

  if (!protect[threadID]) protect[threadID] = { enabled: false };
  const status = args[0];

  if (!status) {
    return api.sendMessage(`🛡️ Protect status: ${protect[threadID].enabled ? "ON ✅" : "OFF ❌"}\nUse: protect on / protect off`, threadID);
  }

  if (status === "on") {
    protect[threadID].enabled = true;
    saveProtect(protect);
    api.sendMessage("🛡️ Group protect system turned ON ✅", threadID);
  } 
  else if (status === "off") {
    protect[threadID].enabled = false;
    saveProtect(protect);
    api.sendMessage("⚠️ Group protect system turned OFF ❌", threadID);
  } 
  else {
    api.sendMessage("❗ Invalid option! Use: protect on / protect off", threadID);
  }
};
