let antiGaliStatus = true; // Default ON now
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
  version: "3.3.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Per-user anti-gali with UID match for kick + admin checks (default ON)",
  commandCategory: "moderation",
  usages: "!antigali on / !antigali off",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event, Threads }) {
  try {
    // if disabled or no text, ignore
    if (!antiGaliStatus || !event.body) return;

    const message = event.body.toLowerCase();
    const threadID = event.threadID;
    const userID = event.senderID;
    const botID = api.getCurrentUserID && api.getCurrentUserID(); // bot uid

    // init tracker
    if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
    if (!offenseTracker[threadID][userID]) offenseTracker[threadID][userID] = { count: 0, uidSaved: userID };

    // check bad words
    if (!badWords.some(word => message.includes(word))) return;

    // increase per-user count
    let userData = offenseTracker[threadID][userID];
    userData.count += 1;
    const count = userData.count;

    // fetch user info and thread info (for admin checks)
    let userInfo = {};
    try {
      userInfo = await api.getUserInfo(userID);
    } catch (e) {
      console.error("getUserInfo error:", e);
    }
    const userName = userInfo[userID]?.name || "User";

    // try to get thread data (to check admin list)
    let threadInfo = {};
    try {
      // prefer Threads.getData if available (some frameworks)
      if (Threads && typeof Threads.getData === "function") {
        const tdata = await Threads.getData(threadID);
        threadInfo = tdata.threadInfo || {};
      } else if (typeof api.getThreadInfo === "function") {
        threadInfo = await api.getThreadInfo(threadID) || {};
      } else {
        // fallback: try api.getThreadList or leave threadInfo empty
        threadInfo = {};
      }
    } catch (e) {
      console.error("get thread info error:", e);
      threadInfo = {};
    }

    // prepare helper to check if a uid is admin in this thread
    const isAdminInThread = (uid) => {
      try {
        if (!threadInfo || !threadInfo.adminIDs) return false;
        return threadInfo.adminIDs.some(item => {
          // item might be object {id: '...'} or string
          if (typeof item === "string") return item == String(uid);
          if (item && item.id) return String(item.id) == String(uid);
          return false;
        });
      } catch (e) {
        return false;
      }
    };

    // Frame-style warning message (includes UID)
    const frameBase = (n, extraLine = '') => (
`╔══════════════════════════════╗
⚠️ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚 #${n}
User: ${userName} (UID: ${userID})
Message contains prohibited words
🔁 Offense Count: ${n}
${extraLine}
╚══════════════════════════════╝`
    );

    // 1st offense
    if (count === 1) {
      const msg = frameBase(1, '🛑 Please clean/unsend immediately');
      await api.sendMessage(msg, threadID, event.messageID);
    }

    // 2nd offense
    else if (count === 2) {
      const msg = frameBase(2, '🛑 Please clean/unsend immediately\n⚠️ Next offense will result in removal');
      await api.sendMessage(msg, threadID, event.messageID);
    }

    // schedule auto-unsend for the offending message (1 minute)
    setTimeout(() => {
      api.unsendMessage(event.messageID).catch(err => {
        // fail silently but log
        console.error("Failed to unsend:", err);
      });
    }, 60000);

    // 3rd offense: attempt to kick, but check admin rules
    if (count === 3) {
      // if bot is not admin -> cannot kick
      const botIsAdmin = botID ? isAdminInThread(botID) : false;
      if (!botIsAdmin) {
        // reset or keep count? keep but notify that bot cannot kick
        // Here we reset to 2 so next offense will again be '3' attempt (optional)
        userData.count = 2;
        return api.sendMessage(
`╔══════════════════════════════╗
⚠️ 𝗔𝗖𝗧𝗜𝗢𝗡 𝗕𝗟𝗢𝗖𝗞𝗘𝗗
I (bot) am not a group admin, so I cannot remove users.
Please promote the bot to admin or have a human admin remove the user.
User: ${userName} (UID: ${userID})
╚══════════════════════════════╝`,
          threadID
        );
      }

      // if target is group admin -> do NOT kick, inform
      if (isAdminInThread(userID)) {
        // reset count to 2 so they get last warning but won't be removed
        userData.count = 2;
        return api.sendMessage(
`╔══════════════════════════════╗
⚠️ 𝗔𝗖𝗧𝗜𝗢𝗡 𝗕𝗟𝗢𝗖𝗞𝗘𝗗
Cannot remove user because they are a group admin.
User: ${userName} (UID: ${userID})
If you believe removal is still needed, a group admin must remove them manually.
╚══════════════════════════════╝`,
          threadID
        );
      }

      // Passed checks -> kick
      try {
        await api.removeUserFromGroup(userID, threadID);
        // reset after successful kick
        userData.count = 0;
        return api.sendMessage(
`🚨 User ${userName} (UID: ${userID}) has been removed due to repeated offenses.`,
          threadID
        );
      } catch (kickErr) {
        console.error("Kick error:", kickErr);
        // if kick failed keep count at 2 to allow retry later
        userData.count = 2;
        return api.sendMessage(
`⚠️ Failed to kick ${userName} (UID: ${userID}). Check bot permissions and try again.`,
          threadID
        );
      }
    }

  } catch (error) {
    console.error("HandleEvent error:", error);
    try {
      await api.sendMessage("⚠️ Anti-Gali system error occurred. Check bot logs.", event.threadID);
    } catch (e) { /* ignore */ }
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
    try {
      await api.sendMessage("⚠️ Failed to run Anti-Gali command. Check bot logs.", event.threadID);
    } catch (e) { /* ignore */ }
  }
};
