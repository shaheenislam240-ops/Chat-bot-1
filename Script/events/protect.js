/* This code official ownar is rX Abdullah 

============= (Maria × rX Chatbot)==========

let threadapi `https:/rx-apis.onrendar/rxAdmin' */


const fs = require("fs");
const path = require("path");

const protectFile = path.join(__dirname, "../../protect.json");

module.exports.config = {
  name: "protect",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
  version: "2.3.1",
  credits: "rX Abdullah", //don't change my cradite
  description: "Always-on group protection (𝐌𝐚𝐫𝐢𝐚 × 𝐫𝐗 𝐂𝐡𝐚𝐭𝐛𝐨𝐭)"
};

// rX apis
function loadProtect() {
  if (!fs.existsSync(protectFile)) fs.writeFileSync(protectFile, JSON.stringify({}, null, 4));
  return JSON.parse(fs.readFileSync(protectFile));
}

// Maria × rX 
function saveProtect(data) {
  fs.writeFileSync(protectFile, JSON.stringify(data, null, 4));
}

if (data.protect !== true) return;

// বট চালু হতেই গ্রুপ ডেটা সেভ
module.exports.run = async function({ api }) {
  try {
    const threads = await api.getThreadList(100, null, ["INBOX"]);
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

// rX Abdullah
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
      // ✅ Admin পরিবর্তন → নতুন ডেটা আপডেট
      if (event.logMessageType === "log:thread-name") {
        const oldName = info.name;
        info.name = threadInfo.threadName;
        saveProtect(protect);
        api.sendMessage(`✅ Admin [${event.author}] changed group name\nOld: ${oldName}\nNew: ${info.name}`, threadID);
      }
      else if (event.logMessageType === "log:thread-icon") {
        info.emoji = threadInfo.emoji;
        saveProtect(protect);
      }
      else if (event.logMessageType === "log:thread-image") {
        info.imagePath = __dirname + "/cache/" + threadID + ".png";
        saveProtect(protect);
      }
      return;
    }

    // ❌ Non-admin পরিবর্তন → restore
    if (event.logMessageType === "log:thread-name") {
      await api.setTitle(info.name, threadID);
      api.sendMessage(`⚠️ Non-admin [${event.author}] tried to change group name\nRestored: ${info.name}`, threadID);
    }
    else if (event.logMessageType === "log:thread-icon") {
      api.changeThreadEmoji(info.emoji, threadID);
      api.sendMessage("⚠️ ইমোজি পরিবর্তন অনুমোদিত নয়!\n🩷 This group is protected", threadID);
    }
    else if (event.logMessageType === "log:thread-image") {
      const pathImg = info.imagePath;
      if (fs.existsSync(pathImg)) {
        api.changeGroupImage(fs.createReadStream(pathImg), threadID);
      }
      api.sendMessage("⚠️ গ্রুপ ছবির পরিবর্তন অনুমোদিত নয়!\n🩷 This group is protected by rX Chat bot", threadID);
    }

  } catch (err) {
    console.error("[Maria Protect Error]", err);
  }
};
