let antiGaliStatus = false; // Default OFF
let offenseTracker = {}; // threadID -> userID -> { count, uidSaved }

const badWords = [
  "কুত্তার বাচ্চা","মাগী","মাগীচোদ","চোদা","চুদ","চুদা","চুদামারান",
  "চুদির","চুত","চুদি","চুতমারানি","চুদের বাচ্চা","shawya","বালের","বালের ছেলে","বালছাল",
  "বালছাল কথা","মাগীর ছেলে","রান্ডি","রান্দি","রান্দির ছেলে","বেশ্যা","বেশ্যাপনা",
  "Khanki","mgi","তোকে চুদি","তুই চুদ","fuck","f***","fck","fuk","fuk","fking","fing","fucking",
  "motherfucker","mf","mfer","motherfuer","mthrfckr","bitch","b!tch","biatch","slut","whore","bastard",
  "asshole","a$$hole","a*hole","dick","d!ck","cock","prick","pussy","Mariak cudi","cunt","fag","faggot","retard",
  "magi","magir","magirchele","rand","randir","randirchele","chuda","chud","chudir","chut","chudi","chutmarani",
  "tor mayer","tor baper","toke chudi","chod"
];

module.exports.config = {
  name: "antigali",
  version: "3.2.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Per-user anti-gali with UID match for kick",
  commandCategory: "moderation",
  usages: "!antigali on / !antigali off",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    if (!antiGaliStatus || !event.body) return;

    const message = event.body.toLowerCase();
    const threadID = event.threadID;
    const userID = event.senderID;

    if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
    if (!offenseTracker[threadID][userID]) offenseTracker[threadID][userID] = { count: 0, uidSaved: userID };

    if (badWords.some(word => message.includes(word))) {
      let userData = offenseTracker[threadID][userID];

      // Increase offense count
      userData.count += 1;
      const count = userData.count;

      const userInfo = await api.getUserInfo(userID);
      const userName = userInfo[userID]?.name || "User";

      // Frame-style messages
      if (count === 1) {
        await api.sendMessage(
`╔══════════════════════════════╗
⚠️ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚 #1
User: ${userName} (UID: ${userID})
Message contains prohibited words
🔁 Offense Count: ${count}
🛑 Please clean/unsend immediately
╚══════════════════════════════╝`,
        threadID, event.messageID);
      }

      if (count === 2) {
        await api.sendMessage(
`╔══════════════════════════════╗
⚠️ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚 #2 (Last Warning)
User: ${userName} (UID: ${userID})
Message contains prohibited words
🔁 Offense Count: ${count}
🛑 Please clean/unsend immediately
⚠️ Next offense will result in removal
╚══════════════════════════════╝`,
        threadID, event.messageID);
      }

      // Auto unsend message after 1 minute
      setTimeout(() => {
        api.unsendMessage(event.messageID).catch(err => console.error("Failed to unsend:", err));
      }, 60000);

      // 3rd offense -> kick if UID matches saved UID
      if (count === 3 && userData.uidSaved === userID) {
        try {
          await api.removeUserFromGroup(userID, threadID);
          userData.count = 0; // reset after kick
          return api.sendMessage(
`🚨 User ${userName} (UID: ${userID}) has been removed due to repeated offenses.`,
          threadID);
        } catch (kickErr) {
          console.error("Kick error:", kickErr);
          return api.sendMessage(
`⚠️ Failed to kick ${userName} (UID: ${userID}). Check bot permissions.`,
          threadID);
        }
      }
    }

  } catch (error) {
    console.error("HandleEvent error:", error);
    await api.sendMessage("⚠️ Anti-Gali system error occurred. Check bot logs.", event.threadID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  try {
    if (args[0] === "on") {
      antiGaliStatus = true;
      return api.sendMessage("✅ Anti-Gali system is now ON", event.threadID);
    } else if (args[0] === "off") {
      antiGaliStatus = false;
      return api.sendMessage("❌ Anti-Gali system is now OFF", event.threadID);
    } else {
      return api.sendMessage("Usage: !antigali on / !antigali off", event.threadID);
    }
  } catch (runErr) {
    console.error("Run command error:", runErr);
    await api.sendMessage("⚠️ Failed to run Anti-Gali command. Check bot logs.", event.threadID);
  }
};
