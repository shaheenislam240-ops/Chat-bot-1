let antiGaliStatus = false; // Default OFF
let offenseTracker = {}; // threadID -> userID -> { count, uidSaved }

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

// 🔹 Activation keywords for ON
const activationWords = [
  // Roman-script / English
  "bc", "BC", "bC", "Bc",
  "matherchod", "Matherchod", "MATHERCHOD",
  "matherchud", "Matherchud", "MATHERCHUD",
  "abal", "Abal", "ABAL",
  "shawya", "Shawya", "SHAWYA",
  "khanki", "Khanki", "KHANKI",
  "magi", "Magi", "MAGI",
  "xhudi", "Xhudi", "XHUDI",
  "chudi", "Chudi", "CHUDI",
  "cudi", "Cudi", "CUDI",
  "cudbo", "Cudbo", "CUDBO",
  "bessi", "Bessi", "BESSI",
  "bokaxhuda", "Bokaxhuda", "BOKAXHUDA",
  "bokachuda", "Bokachuda", "BOKACHUDA",
  "tor mayek chudi", "Tor mayek chudi", "TOR MAYEK CHUDI",
  "Tor mayek xhudi", "tor mayek xhudi", "TOR MAYEK XHUDI",
  "bainxhod", "Bainxhod", "BAINXHOD",
  "vuda", "Vuda", "VUDA",
  "sawa", "Sawa", "SAWA",
  "madarchod", "Madarchod", "MADARCHOD",
  "madarchudi", "Madarchudi", "MADARCHUDI",
  "randi", "Randi", "RANDI",
  "harami", "Harami", "HARAMI",
  "haramzade", "Haramzade", "HARAMZADE",
  "kutti", "Kutti", "KUTTI",
  "chudai", "Chudai", "CHUDAI",
  "bhenchod", "Bhenchod", "BHENCHOD",
  "bhenchud", "Bhenchud", "BHENCHUD",
  "lund", "Lund", "LUND",
  "gandu", "Gandu", "GANDU",
  "ganduchod", "Ganduchod", "GANDUCHOD",
  "lundwa", "Lundwa", "LUNDWA",
  "lundmar", "Lundmar", "LUNDMAR",

  // Bangla-script
  "চুদি", "চুদা", "মাদারচোদ", "মাদারচুদি", "বোনচোদ", "ভোনচোদ", 
  "ভাগচোদ", "শালা", "শালার", "খোকা", "খোকাচোদ", "বেশ্যা", "হরামজাদা",
  "লন্ড", "গান্দু", "গান্ডুচোদ", "কুত্তি", "রান্দি"
];

module.exports.config = {
  name: "shawya",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Auto Anti-Gali system with multiple triggers",
  commandCategory: "moderation",
  usages: "Type any activation word to turn ON Anti-Gali",
  cooldowns: 0,
  prefix: false
};

module.exports.handleEvent = async function ({ api, event, Threads }) {
  try {
    if (!event.body) return;

    const message = event.body.toLowerCase();
    const threadID = event.threadID;
    const userID = event.senderID;

    // 🔹 Check activation keywords (partial match)
    if (activationWords.some(word => message.includes(word))) {
      if (!antiGaliStatus) {
        antiGaliStatus = true;
        api.sendMessage("⚡ Anti-Gali system is now ✅ ON", threadID);

        // Auto exit/restart after 10 minutes (600000 ms)
        setTimeout(() => {
          console.log("⏱ 10 minutes passed, restarting bot...");
          process.exit(1); // bot will restart if managed by PM2 / systemd
        }, 600000);
      }
      return;
    }

    // If Anti-Gali is OFF, ignore everything else
    if (!antiGaliStatus) return;

    // 🔹 Check for bad words
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

    if (count === 1) {
      await api.sendMessage(frameBase(1, '🛑 Please clean/unsend immediately'), threadID, event.messageID);
    } else if (count === 2) {
      await api.sendMessage(frameBase(2, '🛑 Please clean/unsend immediately\n⚠️ Next offense will result in removal'), threadID, event.messageID);
    }

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

module.exports.run = async function ({ api, event, args }) {
  try {
    if (!args[0]) return api.sendMessage("Usage: !shawya on / !shawya off", event.threadID);

    if (args[0] === "on") {
      antiGaliStatus = true;
      return api.sendMessage("✅ Anti-Gali system is now ON", event.threadID);
    } else if (args[0] === "off") {
      antiGaliStatus = false;
      return api.sendMessage("❌ Anti-Gali system is now OFF", event.threadID);
    } else {
      return api.sendMessage("Usage: !shawya on / !shawya off", event.threadID);
    }
  } catch (err) {
    console.error(err);
    try { await api.sendMessage("⚠️ Failed to run Anti-Gali command.", event.threadID); } catch(e){};
  }
};
