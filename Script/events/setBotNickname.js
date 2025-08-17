module.exports.config = {
  name: "botname",
  eventType: ["log:subscribe"],
  version: "1.0.4",
  credits: "rX Abdullah",
  description: "Set bot nickname from global.config and send welcome message"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, logMessageData } = event;
  const addedParticipants = logMessageData.addedParticipants || [];
  const botID = api.getCurrentUserID();

  // global.config থেকে nickname নেবে
  if (!global.config.BOTNAME) return; // যদি config এ কিছু না থাকে, কাজ করবে না
  const botNickname = global.config.BOTNAME;

  for (const participant of addedParticipants) {
    if (participant.userFbId == botID) {
      try {
        // 1️⃣ Bot nickname set
        await api.changeNickname(botNickname, threadID, botID);

        // 2️⃣ Auto message
        const welcomeMessage = "✨ 𝐓𝐡𝐚𝐧𝐤𝐬 𝐟𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐦𝐞! 𝐓𝐲𝐩𝐞 !help 𝐭𝐨 𝐬𝐞𝐞 𝐦𝐲 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬. 💖";
        await api.sendMessage(welcomeMessage, threadID);
      } catch (e) {
        console.log("Bot nickname set বা message পাঠাতে সমস্যা হলো:", e.message);
      }
    }
  }
};
