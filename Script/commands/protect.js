const fs = require("fs");
const axios = require("axios");
const cacheDir = __dirname + "/cache";
const protectPath = cacheDir + "/protect.json";

// Ensure cache folder exists
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

// Load saved protect data
let protectData = {};
if (fs.existsSync(protectPath)) {
  protectData = JSON.parse(fs.readFileSync(protectPath));
}

module.exports.config = {
  name: "protect",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX",
  description: "Protect current group thread automatically",
  commandCategory: "Box",
  usages: "!protect",
  cooldowns: 0,
  dependencies: []
};

module.exports.run = async ({ api, event }) => {
  const threadID = event.threadID;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const name = threadInfo.threadName || "";
    const emoji = threadInfo.emoji || "";

    // Save image
    const avatarUrl = threadInfo.imageSrc;
    const imgPath = cacheDir + "/protect_" + threadID + ".png";
    if (avatarUrl) {
      try {
        const imgData = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(imgPath, Buffer.from(imgData, "binary"));
      } catch (err) {
        api.sendMessage(`❌ Failed to save image for this group`, threadID, event.messageID);
      }
    }

    // Save protect info only for this GC
    protectData[threadID] = { name, emoji, image: imgPath, protect: true };
    fs.writeFileSync(protectPath, JSON.stringify(protectData, null, 2));

    api.sendMessage("✅ This group is now protected! Name, emoji, and image will be restored if changed by non-admins.", threadID, event.messageID);

  } catch (err) {
    api.sendMessage("❌ Failed to activate protect mode for this group!", threadID, event.messageID);
  }
};

// ------------------ Event listener to auto-restore ------------------
module.exports.handleEvent = async ({ api, event }) => {
  const threadID = event.threadID;
  if (!protectData[threadID] || !protectData[threadID].protect) return; // Only protected GC

  try {
    const threadInfo = await api.getThreadInfo(threadID);

    // Ignore admin changes
    if (threadInfo.adminIDs.some(ad => ad.id === event.senderID)) return;

    const { name, emoji, image } = protectData[threadID];

    // Restore name
    if (event.logMessageType === "log:thread-name") api.setTitle(name, threadID);
    // Restore emoji
    if (event.logMessageType === "log:thread-emoji") api.changeThreadEmoji(emoji, threadID);
    // Restore image
    if (event.logMessageType === "log:thread-icon" && fs.existsSync(image)) api.changeGroupImage(fs.createReadStream(image), threadID);

  } catch (err) {
    api.sendMessage(`❌ Error restoring this group`, threadID);
  }
};
