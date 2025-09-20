let antiGaliStatus = false; // Default OFF
let offenseTracker = {}; // threadID -> userID -> { count, uidSaved }
let antiGaliTimeout = null; // Timer to auto-off

const badWords = [
  "কুত্তার বাচ্চা","মাগী","মাগীচোদ","চোদা","চুদ","চুদা","চুদামারান",
  "চুদির","চুত","চুদি","চুতমারানি","চুদের বাচ্চা","shawya","বালের","বালের ছেলে","বালছাল",
  "বালছাল কথা","মাগীর ছেলে","রান্ডি","রান্দি","রান্দির ছেলে","বেশ্যা","বেশ্যাপনা",
  "Khanki","mgi","তোকে চুদি","তুই চুদ","fuck","f***","fck","fuk","fuk","fking","fing","fucking",
  "motherfucker","guyar","mfer","motherfuer","mthrfckr","putki","abdullak chudi","abdullak xudi","jawra","bot chudi","bastard",
  "asshole","a$$hole","a*hole","dick","fu***k","cock","prick","pussy","Mariak cudi","cunt","fag","faggot","retard",
  "magi","magir","magirchele","land","randir","randirchele","chuda","chud","chudir","chut","chudi","chutmarani",
  "tor mayer","tor baper","toke chudi","chod","jairi","khankir pola","khanki magi"
];

module.exports.config = {
  name: "bc",
  version: "4.4.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Auto Anti-Gali: 'bc' chat turns system ON (auto OFF after 5min) and monitors bad words",
  commandCategory: "moderation",
  usages: "Type 'bc' to enable Anti-Gali",
  cooldowns: 0,
  prefix: false
};

module.exports.handleEvent = async function ({ api, event, Threads }) {
  try {
    if (!event.body) return;

    const message = event.body.toLowerCase();
    const threadID = event.threadID;
    const userID = event.senderID;

    // 🔹 If user types "bc", turn Anti-Gali ON
    if (message === "bc","abal","matherchod","hol pagol","magi","bokaxhuda") {
      if (!antiGaliStatus) {
        antiGaliStatus = true;

        // Auto-disable after 5 minutes (300000 ms)
        if (antiGaliTimeout) clearTimeout(antiGaliTimeout);
        antiGaliTimeout = setTimeout(() => {
          antiGaliStatus = false;
          antiGaliTimeout = null;
          api.sendMessage("⚡ Anti-Gali system has automatically turned ❌ OFF after 5 minutes.", threadID).catch(() => {});
        }, 300000); // 5 minutes

      } else {
        // reset timer if already ON
        if (antiGaliTimeout) {
          clearTimeout(antiGaliTimeout);
          antiGaliTimeout = setTimeout(() => {
            antiGaliStatus = false;
            antiGaliTimeout = null;
            api.sendMessage("⚡ Anti-Gali system has automatically turned ❌ OFF after 5 minutes.", threadID).catch(() => {});
          }, 300000);
        }
      }
      return api.sendMessage("⚡ Anti-Gali system is now ✅ ON (will auto-OFF after 5 minutes)", threadID);
    }

    // If Anti-Gali is OFF, ignore everything else
    if (!antiGaliStatus) return;

    // check for bad words
    if (!badWords.some(word => message.includes(word))) return;

    if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
    if (!offenseTracker[threadID][userID]) offenseTracker[threadID][userID] = { count: 0, uidSaved: userID };

    let userData = offenseTracker[threadID][userID];
    userData.count += 1;
    const count = userData.count;

    let userInfo = {};
    try { userInfo = await api.getUserInfo(userID); } catch (e) {}
    const userName = userInfo[userID]?.name || "User";

    let threadInfo = {};
    try {
      if (Threads && typeof Threads.getData === "function") {
        const tdata = await Threads.getData(threadID);
        threadInfo = tdata.threadInfo || {};
      } else if (typeof api.getThreadInfo === "function") {
        threadInfo = await api.getThreadInfo(threadID) || {};
      }
    } catch (e) {}

    const isAdminInThread = (uid) => {
      if (!threadInfo || !threadInfo.adminIDs) return false;
      return threadInfo.adminIDs.some(item => {
        if (typeof item === "string") return item == String(uid);
        if (item && item.id) return String(item.id) == String(uid);
        return false;
      });
    };

    const frameBase = (n, extraLine = '') => (
`╔══════════════════════════════╗
⚠️ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚 #${n}
User: ${userName} (UID: ${userID})
Message contains prohibited words
🔁 Offense Count: ${n}
${extraLine}
╚══════════════════════════════╝`
    );

    // send warning
    let warningMsg = "";
    if (count === 1) warningMsg = frameBase(1, '🛑 Please clean/unsend immediately');
    else if (count === 2) warningMsg = frameBase(2, '🛑 Please clean/unsend immediately\n⚠️ Next offense will result in removal');

    if (warningMsg) {
      const sent = await api.sendMessage(warningMsg, threadID, event.messageID);
      // Auto unsend warning after 1 minute
      setTimeout(() => {
        api.unsendMessage(sent.messageID).catch(() => {});
      }, 60000);
    }

    // Auto-unsend offending message after 1 minute
    setTimeout(() => {
      api.unsendMessage(event.messageID).catch(() => {});
    }, 60000);

    if (count === 3) {
      const botID = api.getCurrentUserID && api.getCurrentUserID();
      const botIsAdmin = botID ? isAdminInThread(botID) : false;
      if (!botIsAdmin) {
        userData.count = 2;
        return api.sendMessage(
`╔══════════════════════════════╗
⚠️ 𝗔𝗖𝗧𝗜𝗢𝗡 𝗕𝗟𝗢𝗖𝗞𝗘𝗗
I am not a group admin, cannot remove users.
User: ${userName} (UID: ${userID})
╚══════════════════════════════╝`, threadID
        );
      }
      if (isAdminInThread(userID)) {
        userData.count = 2;
        return api.sendMessage(
`╔══════════════════════════════╗
⚠️ 𝗔𝗖𝗧𝗜𝗢𝗡 𝗕𝗟𝗢𝗖𝗞𝗘𝗗
Cannot remove user because they are a group admin.
User: ${userName} (UID: ${userID})
╚══════════════════════════════╝`, threadID
        );
      }

      try {
        await api.removeUserFromGroup(userID, threadID);
        userData.count = 0;
        return api.sendMessage(`🚨 User ${userName} (UID: ${userID}) removed due to repeated offenses.`, threadID);
      } catch (kickErr) {
        userData.count = 2;
        return api.sendMessage(`⚠️ Failed to kick ${userName} (UID: ${userID}). Check bot permissions.`, threadID);
      }
    }

  } catch (error) {
    console.error("Anti-gali error:", error);
    try { await api.sendMessage("⚠️ Anti-Gali system error.", event.threadID); } catch(e){};
  }
};
