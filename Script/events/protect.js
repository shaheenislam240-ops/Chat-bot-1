const fs = require("fs");
const path = require("path");

const protectFile = path.join(__dirname, "../../protect.json");

module.exports.config = {
  name: "protect",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
  version: "2.0.0",
  credits: "rX Abdullah",
  description: "Always-on group protection (𝐌𝐚𝐫𝐢𝐚 × 𝐫𝐗 𝐂𝐡𝐚𝐭𝐛𝐨𝐭)"
};

// যখন গ্রুপে কোনো কিছু পরিবর্তন হয়, তখনই রান করবে
module.exports.runEvent = async function ({ event, api }) {
  try {
    if (!fs.existsSync(protectFile)) fs.writeFileSync(protectFile, JSON.stringify({}, null, 4));
    let protect = JSON.parse(fs.readFileSync(protectFile));
    const threadID = event.threadID;

    // গ্রুপ ডেটা না থাকলে, এখনই সেভ করে রাখবে
    if (!protect[threadID]) {
      const info = await api.getThreadInfo(threadID);
      protect[threadID] = {
        name: info.threadName || "Unknown Group",
        emoji: info.emoji || "💬",
        imagePath: __dirname + "/cache/" + threadID + ".png"
      };
      fs.writeFileSync(protectFile, JSON.stringify(protect, null, 4));
      return;
    }

    const info = protect[threadID];

    // 🔒 নাম পরিবর্তন
    if (event.logMessageType === "log:thread-name") {
      api.setTitle(info.name, threadID);
      api.sendMessage("you have no permission to change the group name", threadID);
    }

    // 🔒 ইমোজি পরিবর্তন
    else if (event.logMessageType === "log:thread-icon") {
      api.changeThreadEmoji(info.emoji, threadID);
      api.sendMessage("⚠️ ইমোজি পরিবর্তন অনুমোদিত নয়!\n🩷 Maria Community সিকিউর মোডে আছে।", threadID);
    }

    // 🔒 গ্রুপ ছবি পরিবর্তন
    else if (event.logMessageType === "log:thread-image") {
      const pathImg = info.imagePath;
      if (fs.existsSync(pathImg)) {
        api.changeGroupImage(fs.createReadStream(pathImg), threadID);
      }
      api.sendMessage("⚠️ গ্রুপ ছবির পরিবর্তন অনুমোদিত নয়!\n🩷 this group protect by rX Chat bot", threadID);
    }

  } catch (err) {
    console.error("[Maria Protect Error]", err);
  }
};

// প্রথমবার ম্যানুয়ালি চালিয়ে সেভ করতে পারো
module.exports.run = async function ({ api, event }) {
  try {
    if (!fs.existsSync(protectFile)) fs.writeFileSync(protectFile, JSON.stringify({}, null, 4));
    const threadID = event.threadID;
    const info = await api.getThreadInfo(threadID);

    const protect = JSON.parse(fs.readFileSync(protectFile));
    protect[threadID] = {
      name: info.threadName || "Unknown Group",
      emoji: info.emoji || "💬",
      imagePath: __dirname + "/cache/" + threadID + ".png"
    };

    fs.writeFileSync(protectFile, JSON.stringify(protect, null, 4));

    api.sendMessage("🛡️ 𝐆𝐫𝐨𝐮𝐩 𝐩𝐫𝐨𝐭𝐞𝐜𝐭 𝐦𝐨𝐝𝐞 𝐢𝐬 𝐧𝐨𝐰 𝐨𝐧 🔒", threadID);
  } catch (err) {
    console.error(err);
  }
};
