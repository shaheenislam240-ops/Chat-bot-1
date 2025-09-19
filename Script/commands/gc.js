const fs = require("fs-extra");
const path = require("path");

let gcStatus = {}; // threadID -> true/false
let gcTracker = {}; // threadID -> senderID -> { warned: true, reason: "" }

const gcFile = path.join(__dirname, "cache", "gc.json");

// Load previous data
if (fs.existsSync(gcFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(gcFile, "utf8"));
    gcStatus = data.status || {};
    gcTracker = data.tracker || {};
  } catch (e) {
    console.error("Failed to read gc.json:", e);
  }
}

function saveGCData() {
  try {
    fs.ensureDirSync(path.dirname(gcFile));
    fs.writeFileSync(gcFile, JSON.stringify({ status: gcStatus, tracker: gcTracker }, null, 2));
  } catch (e) {
    console.error("Failed to save gc.json:", e);
  }
}

module.exports.config = {
  name: "gc",
  version: "1.3.0",
  hasPermssion: 2,
  credits: "Rx Abdullah",
  description: "GC OFF protection per user with warning, kick, admin ignore, auto unsend",
  commandCategory: "moderation",
  usages: "!gc off [reason]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const reason = args.slice(1).join(" ") || "No reason provided";

  if (args[0] === "off") {
    gcStatus[threadID] = true; // activate protection
    if (!gcTracker[threadID]) gcTracker[threadID] = {};
    saveGCData();
    return api.sendMessage(`✅ GC protection is now ON for this group. Reason: ${reason}`, threadID);
  } else {
    return api.sendMessage("Usage: !gc off [reason]", threadID);
  }
};

module.exports.handleEvent = async function({ api, event, Threads }) {
  try {
    const threadID = event.threadID;
    const userID = event.senderID;
    const botID = api.getCurrentUserID && api.getCurrentUserID();

    if (!gcStatus[threadID]) return; // only active group
    if (userID === botID) return; // ignore bot messages

    // Get thread info for admin check
    let threadInfo = {};
    try {
      if (Threads && typeof Threads.getData === "function") {
        const tdata = await Threads.getData(threadID);
        threadInfo = tdata.threadInfo || {};
      } else if (typeof api.getThreadInfo === "function") {
        threadInfo = await api.getThreadInfo(threadID) || {};
      }
    } catch (e) { threadInfo = {}; }

    // Helper: check if user is admin
    const isAdminInThread = (uid) => {
      if (!threadInfo.adminIDs) return false;
      return threadInfo.adminIDs.some(item => (item.id || item) == String(uid));
    };

    // Ignore bot admin or group admins
    if (isAdminInThread(userID) || isAdminInThread(botID)) return;

    if (!gcTracker[threadID]) gcTracker[threadID] = {};

    // First offense -> warn user
    if (!gcTracker[threadID][userID]) {
      const reason = event.body?.match(/!gc off (.+)/i)?.[1] || "No reason provided";
      gcTracker[threadID][userID] = { warned: true, reason };
      saveGCData();

      let userInfo = {};
      try { userInfo = await api.getUserInfo(userID); } catch (e) {}
      const userName = userInfo[userID]?.name || "User";

      const warningMsg = await api.sendMessage(
`⚠️ WARNING
User: ${userName} (UID: ${userID})
Message detected in GC OFF group.
Reason: ${reason}
Next message will result in removal.`,
        threadID
      );

      // auto unsend after 10 seconds
      setTimeout(() => {
        api.unsendMessage(warningMsg.messageID).catch(() => {});
      }, 10000);

      return;
    }

    // Second offense -> kick
    try {
      await api.removeUserFromGroup(userID, threadID);
      const reason = gcTracker[threadID][userID]?.reason || "No reason provided";
      delete gcTracker[threadID][userID]; // reset after kick
      saveGCData();

      let userInfo = {};
      try { userInfo = await api.getUserInfo(userID); } catch (e) {}
      const userName = userInfo[userID]?.name || "User";

      return api.sendMessage(
`🚨 ${userName} (UID: ${userID}) has been kicked from the group for repeated messages.
Reason: ${reason}`,
        threadID
      );
    } catch (err) {
      console.error("Failed to kick user:", err);
      return api.sendMessage(`⚠️ Failed to kick ${userID}. Check bot permissions.`, threadID);
    }

  } catch (error) {
    console.error("GC OFF protection error:", error);
  }
};
