let antiGaliStatus = false; // Default OFF
let offenseTracker = {}; // Track per-group per-user offenses

const badWords = [
  "কুত্তার বাচ্চা","মাগী","মাগীচোদ","চোদা","চুদ","চুদা","চুদামারান",
  "চুদির","চুত","চুদি","চুতমারানি","চুদের বাচ্চা","shawya","বালের","বালের ছেলে","বালছাল",
  "বালছাল কথা","মাগীর ছেলে","রান্ডি","রান্দি","রান্দির ছেলে","বেশ্যা","বেশ্যাপনা",
  "Khanki","mgi","তোকে চুদি","তুই চুদ","fuck","f***","f*ck","fu*k","fuk","fking","f***ing","fucking",
  "motherfucker","mf","mfer","motherfu**er","mthrfckr","bitch","b!tch","biatch","slut","whore","bastard",
  "asshole","a$$hole","a**hole","dick","d!ck","cock","prick","pussy","Mariak cudi","cunt","fag","faggot","retard",
  "magi","magir","magirchele","rand","randir","randirchele","chuda","chud","chudir","chut","chudi","chutmarani",
  "tor mayer","tor baper","toke chudi","chod"
];

module.exports.config = {
  name: "antigali",
  version: "2.7.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Auto kick on 3rd offense, leave on 4th, auto unsend (no mention required)",
  commandCategory: "moderation",
  usages: "!antigali on / !antigali off",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    if (!antiGaliStatus) return;
    if (!event.body) return;

    const message = event.body.toLowerCase();
    const threadID = event.threadID;
    const userID = event.senderID;

    if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
    if (!offenseTracker[threadID][userID]) offenseTracker[threadID][userID] = 0;

    if (badWords.some(word => message.includes(word))) {
      offenseTracker[threadID][userID] += 1;
      const count = offenseTracker[threadID][userID];

      const userInfo = await api.getUserInfo(userID);
      const userName = userInfo[userID]?.name || "User";

      const warningMsg = 
`𝗔𝗨𝗧𝗢𝗠𝗢𝗗 𝗔𝗟𝗘𝗥𝗧 🚫
╔════════════════════════════════════╗
║ ⚠️ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚: Offensive Language Detected
║ 👤 User: ${userName}
║ 📄 Message: Contains prohibited words
║ 🔁 Offense Count: ${count}
║ 🧹 Action: Please delete/unsend immediately
╚════════════════════════════════════╝`;

      // Send warning
      await api.sendMessage(warningMsg, threadID, event.messageID);

      // Auto unsend offending message after 1 minute
      setTimeout(() => {
        api.unsendMessage(event.messageID).catch(err => console.error("Failed to unsend:", err));
      }, 60000);

      // 3rd offense -> direct kick
      if (count === 3) {
        try {
          await api.removeUserFromGroup(userID, threadID);
          offenseTracker[threadID][userID] = 0; // reset count after kick
          return api.sendMessage(`🚨 User ${userName} has been removed due to repeated offenses.`, threadID);
        } catch (kickErr) {
          return api.sendMessage(`⚠️ Failed to kick ${userName}. Please check bot permissions.`, threadID);
        }
      }

      // 4th offense -> bot leave
      if (count === 4) {
        try {
          await api.sendMessage("⚠️ I am leaving the group due to repeated offenses and lack of permissions.", threadID);
          offenseTracker[threadID][userID] = 0; // reset count before leave
          return api.leaveThread(threadID);
        } catch (leaveErr) {
          return api.sendMessage("⚠️ Failed to leave the group. Please check bot permissions.", threadID);
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
