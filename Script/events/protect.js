/* Official code by rX Abdullah
============= (Maria × rX Chatbot)========== */

const fs = require("fs");
const path = require("path");

// কাস্টম JSON ফাইল লোকেশন
const protectFile = path.join(__dirname, "rx/protect.json");

module.exports.config = {
  name: "protect",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
  version: "2.3.2",
  credits: "rX Abdullah", // ক্রেডিট পরিবর্তন করা যাবে না
  description: "গ্রুপ প্রোটেকশন সিস্টেম (শুধুমাত্র সেভ করা গ্রুপ রিস্টোর করবে)"
};

// JSON লোড
function loadProtect() {
  if (!fs.existsSync(protectFile)) fs.writeFileSync(protectFile, JSON.stringify({}, null, 4));
  return JSON.parse(fs.readFileSync(protectFile));
}

// JSON সেভ
function saveProtect(data) {
  fs.writeFileSync(protectFile, JSON.stringify(data, null, 4));
}

// ❌ Auto-save বন্ধ
module.exports.run = async function({ api }) {
  console.log("🛡️ Group protect auto-save বন্ধ। শুধু সেভ করা গ্রুপ রিস্টোর হবে।");
};

// ইভেন্ট হ্যান্ডলার
module.exports.runEvent = async function({ event, api }) {
  try {
    let protect = loadProtect();
    const threadID = event.threadID;

    // যদি গ্রুপ JSON এ না থাকে → ignore
    if (!protect[threadID]) return;

    const info = protect[threadID];
    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(adm => adm.id == event.author);

    if (isAdmin) {
      // ✅ Admin পরিবর্তন হলে JSON আপডেট
      if (event.logMessageType === "log:thread-name") {
        const oldName = info.name;
        info.name = threadInfo.threadName;
        saveProtect(protect);
        api.sendMessage(`✅ Admin [${event.author}] গ্রুপ নাম পরিবর্তন করলো\nপুরানো: ${oldName}\nনতুন: ${info.name}`, threadID);
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
      api.sendMessage(`⚠️ Non-admin [${event.author}] গ্রুপ নাম পরিবর্তন করার চেষ্টা করলো\nরিস্টোর: ${info.name}`, threadID);
    }
    else if (event.logMessageType === "log:thread-icon") {
      api.changeThreadEmoji(info.emoji, threadID);
      api.sendMessage("⚠️ ইমোজি পরিবর্তন অনুমোদিত নয়!\n🩷 এই গ্রুপ প্রোটেক্টেড", threadID);
    }
    else if (event.logMessageType === "log:thread-image") {
      const pathImg = info.imagePath;
      if (fs.existsSync(pathImg)) {
        api.changeGroupImage(fs.createReadStream(pathImg), threadID);
      }
      api.sendMessage("⚠️ গ্রুপ ছবি পরিবর্তন অনুমোদিত নয়!\n🩷 এই গ্রুপ rX Chatbot দ্বারা প্রোটেক্টেড", threadID);
    }

  } catch (err) {
    console.error("[Maria Protect Error]", err);
  }
};
