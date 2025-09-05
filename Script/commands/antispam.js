const spamTracker = {};

module.exports.config = {
  name: "antispam",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX",
  description: "Auto restart bot if spam detected",
  commandCategory: "system",
  usages: "",
  cooldowns: 0
};

module.exports.handleEvent = async function({ api, event }) {
  const { threadID, senderID } = event;

  if (!spamTracker[senderID]) {
    spamTracker[senderID] = { count: 1, time: Date.now() };
  } else {
    let data = spamTracker[senderID];
    let now = Date.now();

    if (now - data.time < 5000) { // ৫ সেকেন্ডের মধ্যে
      data.count++;
    } else {
      data.count = 1;
      data.time = now;
    }

    // যদি ৫ সেকেন্ডে 10 বার এর বেশি message পাঠায়
    if (data.count >= 10) {
      api.sendMessage(
        `${global.config.BOTNAME} ⚠️ Spam Detected!\nAuto Restarting...`,
        threadID,
        () => process.exit(1) // Restart এর জন্য exit
      );
    }
  }
};
