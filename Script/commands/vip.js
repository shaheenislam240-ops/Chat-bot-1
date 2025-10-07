const fs = require("fs");
const path = require("path");

const protectFile = path.join(__dirname, "Script", "events", "rx", "protect.json");

module.exports.config = {
  name: "vip",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Show all VIP groups (name + threadID) from protect.json",
  commandCategory: "Admin",
};

function loadProtect() {
  if (!fs.existsSync(protectFile)) return {};
  return JSON.parse(fs.readFileSync(protectFile, "utf-8"));
}

module.exports.run = async function({ api, event }) {
  try {
    const protect = loadProtect();
    let msg = "VIP Groups List:\n\n";
    let count = 1;

    for (let tid in protect) {
      const group = protect[tid];
      msg += `${count}. ${group.name || "Unknown"}\n`;
      msg += `Tid - ${tid}\n\n`;
      count++;
    }

    if (count === 1) msg = "No VIP groups found.";

    api.sendMessage(msg, event.threadID);
  } catch (err) {
    console.error("[VIP Command Error]", err);
    api.sendMessage("Error loading VIP groups.", event.threadID);
  }
};
