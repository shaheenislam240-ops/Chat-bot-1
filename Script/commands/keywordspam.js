const spamTracker = {};
const KEYWORDS = ["😂", "🤣", "bby", "baby", "bot"]; // keyword list
const TIME_FRAME = 10000; // 10 সেকেন্ড
const MAX_COUNT = 10;     // 10 বার message
const RESTART_COOLDOWN = 60000; // 1 min cooldown to prevent multiple restarts

let lastRestartTime = 0;

module.exports.config = {
  name: "keywordspam",
  version: "1.0.0",
  credits: "rX",
  description: "Detect keyword spam in group and auto restart bot",
  eventType: ["message"]
};

module.exports.run = async function({ api, event }) {
  const { threadID, senderID, body } = event;
  if (!body) return;

  // check if message contains any keyword
  const containsKeyword = KEYWORDS.some(k => body.toLowerCase().includes(k.toLowerCase()));
  if (!containsKeyword) return;

  // track spam per user
  if (!spamTracker[senderID]) {
    spamTracker[senderID] = { count: 1, time: Date.now() };
  } else {
    let data = spamTracker[senderID];
    let now = Date.now();

    if (now - data.time < TIME_FRAME) {
      data.count++;
    } else {
      data.count = 1;
      data.time = now;
    }

    // check if limit reached
    if (data.count >= MAX_COUNT) {
      let senderName = "Unknown";
      try {
        const userInfo = await api.getUserInfo(senderID);
        senderName = userInfo[senderID].name || senderName;
      } catch(e) {}

      const now = Date.now();
      if (now - lastRestartTime > RESTART_COOLDOWN) {
        lastRestartTime = now;
        // send warning message in group and restart
        api.sendMessage(
          `⚠️ Keyword Spam Detected from ${senderName}!\n${global.config.BOTNAME} is now restarting...`,
          threadID,
          () => process.exit(1)
        );
      }

      // reset count to avoid multiple triggers
      spamTracker[senderID].count = 0;
      return;
    }
  }
};
