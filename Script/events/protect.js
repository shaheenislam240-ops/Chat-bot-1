const fs = require("fs");
const path = require("path");

const protectFile = path.join(__dirname, "../../protect.json");

module.exports.config = {
  name: "protect",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
  version: "2.3.0",
  credits: "rX Abdullah",
  description: "Always-on group protection (𝐌𝐚𝐫𝐢𝐚 × 𝐫𝐗 𝐂𝐡𝐚𝐭𝐛𝐨𝐭)"
};

// ফাইল লোড বা নতুন তৈরি
function loadProtect() {
  if (!fs.existsSync(protectFile)) fs.writeFileSync(protectFile, JSON.stringify({}, null, 4));
  return JSON.parse(fs.readFileSync(protectFile));
}

// ফাইল সেভ
function saveProtect(data) {
  fs.writeFileSync(protectFile, JSON.stringify(data, null, 4));
}

// বট চালু হতেই গ্রুপ ডেটা সেভ
module.exports.run = async function({ api }) {
  try {
    const threads = await api.getThreadList(100, null, ["INBOX"]); // সর্বাধিক 100 গ্রুপ
    let protect = loadProtect();

    for (const thread of threads) {
      const info = await api.getThreadInfo(thread.threadID);
      if (!protect[thread.threadID]) {
        protect[thread.threadID] = {
          name: info.threadName || "Unknown Group",
          emoji: info.emoji || "💬",
          imagePath: __dirname + "/cache/" + thread.threadID + ".png"
        };
      }
    }

    saveProtect(protect);
    console.log("🛡️ Group protect data initialized.");
  } catch (err) {
    console.error("[Maria Protect Init Error]", err);
  }
};

// ইভেন্ট রান
module.exports.runEvent = async function({ event, api }) {
  try {
    let protect = loadProtect();
    const threadID = event.threadID;
    const threadInfo = await api.getThreadInfo(threadID);

    // গ্রুপ যদি আগে সেভ না থাকে, নতুন করে সেভ
    if (!protect[threadID]) {
      protect[threadID] = {
        name: threadInfo.threadName || "Unknown Group",
        emoji: threadInfo.emoji || "💬",
        imagePath: __dirname + "/cache/" + threadID + ".png"
      };
      saveProtect(protect);
      return;
    }

    const info = protect[threadID];
    const isAdmin = threadInfo.adminIDs.some(adm => adm.id == event.author);

    if (isAdmin) {
      // অ্যাডমিন পরিবর্তন করলে নতুন ডেটা আপডেট হবে
      if (event.logMessageType === "log:thread-name") info.name = threadInfo.threadName;
      else if (event.logMessageType === "log:thread-icon") info.emoji = threadInfo.emoji;
      else if (event.logMessageType === "log:thread-image") info.imagePath = __dirname + "/cache/" + threadID + ".png";
      saveProtect(protect);
      return;
    }

    // নন-অ্যাডমিন পরিবর্তন হলে restore
    if (event.logMessageType === "log:thread-name") {
      api.setTitle(info.name, threadID);
      api.sendMessage("> 🎀\n𝐎𝐧𝐥𝐲 𝐚𝐝𝐦𝐢𝐧 𝐜𝐚𝐧 𝐜𝐡𝐚𝐧𝐠𝐞 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐧𝐚𝐦𝐞", threadID);
    }
    else if (event.logMessageType === "log:thread-icon") {
      api.changeThreadEmoji(info.emoji, threadID);
      api.sendMessage("⚠️ ইমোজি পরিবর্তন অনুমোদিত নয়!\\n🩷  this group has protected", threadID);
    }
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
