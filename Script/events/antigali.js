let antiGaliStatus = true; // Default OFF
let offenseTracker = {}; // Track per-group per-user offenses

const badWords = [
  // বাংলা ও ইংরেজি গালি
  "আবাল","চুদা","চুদি","চোদ","চোদা","চুত","চুতমারানি","চুদাচুদি","চোদাচুদি","চুদিনি",
  "চোদন","চোদনখোর","পুটকি","গান্ড","গান্ডু","মাদারচোদ","বোকাচোদা","হারামি","শুয়োরের বাচ্চা",
  "কুত্তার বাচ্চা","কুত্তি","রান্ডি","ভোদার","বেশ্যা","বেশ্যাচোদা","চুতিরবাচ্চা","খাঙ্কি","সাউয়া",
  "মাং","খানকি","ভোদা","জরজ","সাউয়ার","বেদশি","মাদরি","মাং","কুত্তার পোলা","হারামজাদা","শুয়োর",
  "ডুকর","চদমারানী","চদপোকা","চুদপোকা","শুয়োরের ছানা","কুত্তার ছানা","চুতিরপোলা","বেশ্যাপুত",
  "বোকাচোদ","হেডা","হোগা","লম্পট","চোদাচুদি","heda","চুদনি",
  "fuck","fucking","motherfucker","mother fucker","mf","fucker","bitch","son of a bitch","slut","whore",
  "asshole","bastard","dick","chdi","retard","pussy","cunt","gay","lesbian","xodi","nigga","nigger",
  "cock","jerk","wanker","porn","sucker","bollocks","bloody hell","xoda","bullshit","voda","douche","douchebag",
  "moron","hada","scumbag","Head","prick","fag","faggot"
];

module.exports.config = {
  name: "antigali",
  version: "4.0.0",
  hasPermssion: 1,
  credits: "Rx Abdullah",
  description: "Admin ছাড়া কেউ বকা দিলে ৩ বার পরে কিক করবে, warning আগে",
  commandCategory: "Group",
  usages: "!antigali on / !antigali off",
  cooldowns: 0,
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    if (!antiGaliStatus) return;
    const { threadID, senderID, body, messageID } = event;
    if (!body) return;

    const msg = body.toLowerCase();

    // Group info থেকে এডমিন চেক
    let admins = [];
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      admins = threadInfo.adminIDs.map(admin => admin.id);
    } catch (e) {
      console.log("❌ এডমিন লিস্ট লোড করতে সমস্যা:", e);
    }

    if (admins.includes(senderID)) return; // এডমিন হলে skip

    if (badWords.some(word => msg.includes(word))) {

      if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
      if (!offenseTracker[threadID][senderID]) offenseTracker[threadID][senderID] = 0;

      offenseTracker[threadID][senderID] += 1;
      const count = offenseTracker[threadID][senderID];

      const userInfo = await api.getUserInfo(senderID);
      const userName = userInfo[senderID]?.name || "User";

      // Auto unsend offending message after 1 minute
      setTimeout(() => {
        api.unsendMessage(messageID).catch(err => console.error("Failed to unsend:", err));
      }, 60000);

      // 1st & 2nd offense -> warning (AUTOMOD ALERT)
      if (count < 3) {
        const warningMsg = 
`𝗔𝗨𝗧𝗢𝗠𝗢𝗗 𝗔𝗟𝗘𝗥𝗧 🚫
╔════════════════════════════════════╗
║ ⚠️ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚: Offensive Language Detected
║ 👤 User: ${userName}
║ 📄 Message: Contains prohibited words
║ 🔁 Offense Count: ${count}
║ 🧹 Action: Please delete/unsend immediately
╚════════════════════════════════════╝`;

        return api.sendMessage(warningMsg, threadID);
      }

      // 3rd offense -> kick using autokick logic
      if (count === 3) {
        try {
          await api.sendMessage(
            `❌ @${senderID} তুমি ৩ বার বাজে শব্দ ব্যবহার করেছো। তাই তোমাকে গ্রুপ থেকে কিক করা হলো! 🚫`,
            threadID,
            () => api.removeUserFromGroup(senderID, threadID),
            { mentions: [{ tag: "User", id: senderID }] }
          );
          offenseTracker[threadID][senderID] = 0; // reset after kick
        } catch (kickErr) {
          return api.sendMessage(`⚠️ Failed to kick ${userName}. Check bot permissions.`, threadID);
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
