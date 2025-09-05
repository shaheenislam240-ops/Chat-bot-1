const spamTracker = {};

module.exports.config = {
  name: "antispam",
  eventType: ["message"],
  version: "1.1.0",
  credits: "rX",
  description: "Detect per-user spam and auto restart bot with sender name"
};

module.exports.run = async function({ api, event }) {
  const { threadID, senderID } = event;

  // sender name fetch
  let senderName = "Unknown";
  try {
    const userInfo = await api.getUserInfo(senderID);
    senderName = userInfo[senderID].name || senderName;
  } catch(e) {
    console.log("Failed to fetch user name:", e);
  }

  // senderID ভিত্তিক spam track
  if (!spamTracker[senderID]) {
    spamTracker[senderID] = { count: 1, time: Date.now() };
  } else {
    let data = spamTracker[senderID];
    let now = Date.now();

    if (now - data.time < 5000) { // ৫ সেকেন্ডে
      data.count++;
    } else {
      data.count = 1;
      data.time = now;
    }

    // যদি একজন user ৫ সেকেন্ডে ১০+ বার মেসেজ দেয়
    if (data.count >= 10) {
      api.sendMessage(
        `${global.config.BOTNAME} ⚠️ Spam Detected from: ${senderName}\n${global.config.BOTNAME} 𝐈𝐬 𝐧𝐨𝐰 𝐑𝐞𝐬𝐭𝐚𝐫𝐭𝐢𝐧𝐠...`,
        threadID,
        () => process.exit(1) // pm2/nodemon এ চালালে auto restart হবে
      );
    }
  }
};
