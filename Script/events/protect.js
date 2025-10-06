const fs = require("fs");
const axios = require("axios");
const protectFile = __dirname + "/cache/protect.json";

module.exports.config = {
  name: "protect",
  eventType: ["log:thread-name", "log:thread-icon", "change_thread_image"],
  version: "1.0.0",
  credits: "rX Abdullah",
  description: "Protect GC name, emoji, and image",
};

module.exports.run = async ({ api, event, args }) => {
  if (!fs.existsSync(protectFile)) fs.writeFileSync(protectFile, JSON.stringify({}, null, 2));
  const data = JSON.parse(fs.readFileSync(protectFile));
  const threadID = event.threadID;
  const type = args[0]?.toLowerCase();

  if (type === "on") {
    const info = await api.getThreadInfo(threadID);
    data[threadID] = {
      name: info.threadName || "",
      emoji: info.emoji || "",
      image: info.imageSrc || "",
      enabled: true,
    };
    fs.writeFileSync(protectFile, JSON.stringify(data, null, 2));
    return api.sendMessage("🛡 Protection enabled for this group.", threadID, event.messageID);
  } else if (type === "off") {
    if (data[threadID]) delete data[threadID];
    fs.writeFileSync(protectFile, JSON.stringify(data, null, 2));
    return api.sendMessage("❌ Protection disabled for this group.", threadID, event.messageID);
  } else {
    return api.sendMessage("📘 Usage: !protect on/off", threadID, event.messageID);
  }
};

module.exports.runEvent = async ({ api, event }) => {
  const { threadID, logMessageType } = event;
  if (!fs.existsSync(protectFile)) return;
  const data = JSON.parse(fs.readFileSync(protectFile));
  if (!data[threadID] || !data[threadID].enabled) return;

  const saved = data[threadID];
  const info = await api.getThreadInfo(threadID);
  const botID = api.getCurrentUserID();
  const isAdmin = info.adminIDs.some(a => a.id == botID);
  if (!isAdmin) return;

  try {
    if (logMessageType === "log:thread-name" && info.threadName !== saved.name) {
      await api.setTitle(saved.name, threadID);
      return api.sendMessage("🔒 Group name restored.", threadID);
    }

    if (logMessageType === "log:thread-icon" && info.emoji !== saved.emoji) {
      await api.changeThreadEmoji(saved.emoji, threadID);
      return api.sendMessage("🔒 Group emoji restored.", threadID);
    }

    if (logMessageType === "change_thread_image") {
      const url = info.imageSrc;
      if (saved.image && url !== saved.image) {
        const imgData = (await axios.get(saved.image, { responseType: "arraybuffer" })).data;
        const path = __dirname + "/cache/tmp.jpg";
        fs.writeFileSync(path, Buffer.from(imgData, "binary"));
        await api.changeGroupImage(fs.createReadStream(path), threadID);
        fs.unlinkSync(path);
        return api.sendMessage("🔒 Group photo restored.", threadID);
      }
    }
  } catch (err) {
    return api.sendMessage("⚠️ Error restoring group data.", threadID);
  }
};
