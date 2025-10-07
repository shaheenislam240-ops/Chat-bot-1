const fs = require("fs");
const path = require("path");

// 🔹 Manual JSON location
const protectFile = path.join(__dirname, "rx", "protect.json"); // protect.json location

module.exports.config = {
name: "protect",
eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
version: "2.4.0",
credits: "rX Abdullah",
description: "Manual group protection (Maria × rX Chatbot)"
};

// 🔒 Load JSON
function loadProtect() {
if (!fs.existsSync(protectFile)) {
console.error("❌ protect.json not found! Add group info manually first.");
return {};
}
return JSON.parse(fs.readFileSync(protectFile));
}

// 🚫 No auto-save
module.exports.run = async function() {
console.log("🛡️ Manual Protect system active. Using pre-defined JSON.");
};

// ⚙️ Event handler
module.exports.runEvent = async function({ event, api }) {
try {
const protect = loadProtect();
const threadID = event.threadID;

// If group not in JSON → ignore  
if (!protect[threadID]) return;  

const info = protect[threadID];  
const threadInfo = await api.getThreadInfo(threadID);  
const isAdmin = threadInfo.adminIDs.some(adm => adm.id == event.author);  

// ✅ Admin → changes allowed  
if (isAdmin) return;  

// ❌ Non-admin → restore from JSON  
if (event.logMessageType === "log:thread-name") {  
  await api.setTitle(info.name, threadID);  
  await api.sendMessage(`⚠️ Non-admin [${event.author}] tried to change group name\nRestored: ${info.name}`, threadID);  
}  
else if (event.logMessageType === "log:thread-icon") {  
  await api.changeThreadEmoji(info.emoji, threadID);  
  await api.sendMessage("⚠️ ইমোজি পরিবর্তন অনুমোদিত নয়!\n🩷 This group is protected", threadID);  
}  
else if (event.logMessageType === "log:thread-image") {  
  const pathImg = path.join(__dirname, "rx", "cache", threadID + ".png");  
  if (fs.existsSync(pathImg)) {  
    await api.changeGroupImage(fs.createReadStream(pathImg), threadID);  
  }  
  await api.sendMessage("⚠️ গ্রুপ ছবির পরিবর্তন অনুমোদিত নয়!\n🩷 This group is protected by rX Chat bot", threadID);  
}

} catch (err) {
console.error("[Manual Protect Error]", err);
}
};

