let antiGaliStatus = false; // Default OFF
let offenseTracker = {}; // Track per-group per-user offenses

const badWords = [
  "কুত্তার বাচ্চা","মাগী","মাগীচোদ","চোদা","চুদ","চুদা","চুদামারান",
  "চুদির","চুত","চুদি","চুতমারানি","চুদের বাচ্চা","shawya","বালের","বালের ছেলে","বালছাল",
  "বালছাল কথা","মাগীর ছেলে","রান্ডি","রান্দি","রান্দির ছেলে","বেশ্যা","বেশ্যাপনা",
  "Khanki","mgi","তোকে চুদি","তুই চুদ","fuck","f***","f*ck","fu*k","fuk","fking","f***ing","fucking",
  "motherfucker","mf","mfer","motherfu**er","mthrfckr","bessi","mahirak xhudi","maria re cudi","maria re xhudi","mariak chudi","bastard",
  "asshole","a$$hole","a**hole","dick","shawya","cock","prick","pussy","Mariak cudi","cunt","fag","faggot","retard",
  "magi","magir","magirchele","abdullahk cudi","randir","randirchele","chuda","chud","chudir","chut","chudi","chutmarani",
  "tor mayer","tor baper","toke chudi","chod"
];

module.exports.config = {
  name: "antigali",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Auto offensive word detector with mention, ON/OFF, and progressive action",
  commandCategory: "moderation",
  usages: "!antigali on / !antigali off",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    if (!antiGaliStatus) return; // OFF থাকলে কিছু করবে না
    if (!event.body) return;

    const message = event.body.toLowerCase();
    const threadID = event.threadID;
    const userID = event.senderID;

    // Initialize offense tracker
    if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
    if (!offenseTracker[threadID][userID]) offenseTracker[threadID][userID] = 0;

    if (badWords.some(word => message.includes(word))) {
      offenseTracker[threadID][userID] += 1;
      const count = offenseTracker[threadID][userID];

      const userInfo = await api.getUserInfo(userID);
      const userName = userInfo[userID]?.name || "User";

      const mentionTag = { id: userID, tag: userName };

      const warningMsg = 
`𝗔𝗨𝗧𝗢𝗠𝗢𝗗 𝗔𝗟𝗘𝗥𝗧 🚫
╔════════════════════════════════════╗
║ ⚠️ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚: Offensive Language Detected
║ 👤 User: @${mentionTag.tag}
║ 📄 Message: Contains prohibited words
║ 🧹 Action: Please delete/unsend immediately
║ 🔁 Offense Count: ${count}
╚════════════════════════════════════╝
⚠️ Reminder: Please speak respectfully.`;

      await api.sendMessage({ body: warningMsg, mentions: [mentionTag] }, threadID, event.messageID);

      // Handle progressive action
      if (count >= 3) {
        try {
          const botInfo = await api.getCurrentUserID();
          const threadInfo = await api.getThreadInfo(threadID);
          const botIsAdmin = threadInfo.adminIDs.some(adm => adm.id == botInfo);

          if (botIsAdmin) {
            // Kick user
            await api.removeUserFromGroup(userID, threadID);
            offenseTracker[threadID][userID] = 0; // Reset offense count after kick
            return api.sendMessage(`🚨 User @${mentionTag.tag} has been removed due to repeated offenses.`, threadID, null, { mentions: [mentionTag] });
          } else {
            // Bot not admin -> leave group on 4th offense
            if (count >= 4) {
              await api.sendMessage("⚠️ I cannot moderate properly. Leaving the group.", threadID);
              return api.leaveThread(threadID);
            }
          }
        } catch (err) {
          console.error("Error handling kick/leave:", err);
        }
      }
    }

  } catch (error) {
    console.error(error);
  }
};

module.exports.run = async function ({ api, event, args }) {
  if (args[0] === "on") {
    antiGaliStatus = true;
    return api.sendMessage("✅ Anti-Gali system is now **ON**", event.threadID);
  } else if (args[0] === "off") {
    antiGaliStatus = false;
    return api.sendMessage("❌ Anti-Gali system is now **OFF**", event.threadID);
  } else {
    return api.sendMessage("Usage: !antigali on / !antigali off", event.threadID);
  }
};
