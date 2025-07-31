module.exports.config = {
  name: "unsreact",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "rX",
  description: "🐣 রিয়্যাক্ট দিলে বটের মেসেজ আনসেন্ড হবে",
  commandCategory: "system",
  usages: "React 🐣 on a bot message",
  cooldowns: 0
};

module.exports.handleReaction = async function ({ api, event }) {
  // শুধু 🐣 ইমোজি হলে কাজ করবে
  if (event.reaction !== "🐣") return;

  // বটের নিজস্ব ID
  const botID = api.getCurrentUserID();

  try {
    // মেসেজ ইনফো বের করো
    const messageInfo = await api.getMessageInfo(event.messageID);
    const senderID = messageInfo.senderID;

    // চেক করো মেসেজটি বট নিজে পাঠিয়েছে কিনা
    if (senderID === botID) {
      // মেসেজ আনসেন্ড করো
      return api.unsendMessage(event.messageID);
    }

  } catch (err) {
    console.log("🐣 UnsReact Error:", err.message);
  }
};
