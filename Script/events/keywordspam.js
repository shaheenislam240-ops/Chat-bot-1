const spamTracker = {};
const KEYWORDS = ["😂", "🤣", "bby", "baby", "bot"]; // keyword list
const TIME_FRAME = 10000; // ১০ সেকেন্ড
const MAX_COUNT = 10;     // ১০ বার message

module.exports.config = {
  name: "keywordspam",
  eventType: ["message"],
  version: "1.0.0",
  credits: "rX",
  description: "Detect keyword spam and auto restart bot"
};

module.exports.run = async function({ api, event }) {
  const { threadID, senderID, body } = event;

  // check if message contains any keyword
  if (!body) return;
  const containsKeyword = KEYWORDS.some(k => body.toLowerCase().includes(k.toLowerCase()));
  if (!containsKeyword) return;

  // spam track per user
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

    if (data.count >= MAX_COUNT) {
      // fetch sender name
      let senderName = "Unknown";
      try {
        const userInfo = await api.getUserInfo(senderID);
        senderName = userInfo[senderID].name || senderName;
      } catch(e) {}

      api.sendMessage(
        `${global.config.BOTNAME} ⚠️ Keyword Spam Detected from: ${senderName}\n${global.config.BOTNAME} 𝐈𝐬 𝐧𝐨𝐰 𝐑𝐞𝐬𝐭𝐚𝐫𝐭𝐢𝐧𝐠...`,
        threadID,
        () => process.exit(1)
      );
    }
  }
};
