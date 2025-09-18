// modules/events/antigali.js
let antiGaliStatus = false; // Default OFF
let offenseTracker = {}; 

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

module.exports = {
  antiGaliStatus, // অন্য ফাইল থেকে access এর জন্য
  setStatus: (status) => { antiGaliStatus = status; },
  handleEvent: async function ({ api, event }) {
    try {
      if (!antiGaliStatus) return;
      const { threadID, senderID, body, messageID } = event;
      if (!body) return;

      const msg = body.toLowerCase();

      // Group info থেকে admin check
      let admins = [];
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        admins = threadInfo.adminIDs.map(admin => admin.id);
      } catch (e) { console.log("❌ এডমিন লিস্ট লোড করতে সমস্যা:", e); }
      if (admins.includes(senderID)) return;

      if (badWords.some(word => msg.includes(word))) {
        if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
        if (!offenseTracker[threadID][senderID]) offenseTracker[threadID][senderID] = 0;
        offenseTracker[threadID][senderID] += 1;
        const count = offenseTracker[threadID][senderID];

        const userInfo = await api.getUserInfo(senderID);
        const userName = userInfo[senderID]?.name || "User";

        // Auto unsend 1 minute
        setTimeout(() => {
          api.unsendMessage(messageID).catch(err => console.error("Failed to unsend:", err));
        }, 60000);

        // 1st & 2nd offense -> warning
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

        // 3rd offense -> kick
        if (count === 3) {
          try {
            await api.sendMessage(
              `❌ @${senderID} তুমি ৩ বার বাজে শব্দ ব্যবহার করেছো। তাই তোমাকে গ্রুপ থেকে কিক করা হলো! 🚫`,
              threadID,
              () => api.removeUserFromGroup(senderID, threadID),
              { mentions: [{ tag: "User", id: senderID }] }
            );
            offenseTracker[threadID][senderID] = 0;
          } catch (kickErr) {
            return api.sendMessage(`⚠️ Failed to kick ${userName}. Check bot permissions.`, threadID);
          }
        }
      }
    } catch (err) { console.error(err); }
  }
};
