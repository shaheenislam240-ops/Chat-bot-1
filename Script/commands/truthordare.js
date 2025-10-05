const axios = require("axios");

module.exports.config = {
  name: "truthordare",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "rX Abdullah + ChatGPT",
  description: "Play truth or dare using questions from your Render API (debug-ready)",
  commandCategory: "fun",
  usages: "[optional: truth/dare]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  const name = await Users.getNameUser(senderID);

  // 👇 তোমার Render API URL
  const baseAPI = "https://true-false-api-9cq3.onrender.com/truthdare";

  // ইউজার input truth/dare বা random
  const typeInput = args[0]?.toLowerCase();
  const type = typeInput === "truth" || typeInput === "dare"
    ? typeInput
    : Math.random() < 0.5
      ? "truth"
      : "dare";

  // Countdown
  const countdown = [
    { text: "⏳ 3...", delay: 1000 },
    { text: "⏳ 2...", delay: 2000 },
    { text: "⏳ 1...", delay: 3000 },
    { text: "🎉 Ready!", delay: 4000 }
  ];

  for (const step of countdown) {
    setTimeout(() => api.sendMessage(step.text, threadID), step.delay);
  }

  setTimeout(async () => {
    try {
      // ✅ Axios call with timeout
      const res = await axios.get(`${baseAPI}/${type}`, { timeout: 10000 });
      console.log("DEBUG: API response:", res.data);

      const question = res.data?.question || "⚠️ Couldn't get question from API.";

      const msg = `${type === "truth" ? "🟢 𝗧𝗥𝗨𝗧𝗛 𝗧𝗜𝗠𝗘" : "🔴 𝗗𝗔𝗥𝗘 𝗧𝗜𝗠𝗘"}\n` +
        `➤ ${name}, ${type === "truth" ? "answer this question honestly" : "complete this dare"}:\n` +
        `${question}\n\n💬 Reply to this message with your ${type === "truth" ? "answer" : "proof"}.`;

      api.sendMessage(msg, threadID, (err, info) => {
        if(err) console.error("DEBUG: sendMessage error:", err);

        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: senderID,
          authorName: name,
          type
        });
      }, messageID);

    } catch (err) {
      console.error("DEBUG: API fetch error:", err.message);
      api.sendMessage(`⚠️ Failed to fetch question from API.\nDEBUG: ${err.message}`, threadID, messageID);
    }
  }, 5000);
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;

  if (senderID !== handleReply.author)
    return api.sendMessage("🚫 Only the selected player can reply to this!", threadID, messageID);

  const answer = body.toLowerCase();
  let type = "", quoteEN = "";

  const positiveWords = ["yes", "done", "complete", "হ্যাঁ", "ok", "sure", "হ্যা", "finished", "done it"];
  const negativeWords = ["no", "never", "না", "nope", "can't", "cannot"];

  if (positiveWords.some(w => answer.includes(w))) {
    type = "good";
    const q = [
      "Nice! You’re honest and brave!",
      "Good job! You completed your dare!",
      "That’s the spirit 👏"
    ];
    quoteEN = q[Math.floor(Math.random() * q.length)];
  } else if (negativeWords.some(w => answer.includes(w))) {
    type = "bad";
    const q = [
      "Ohh, maybe next time 😅",
      "You skipped it? That’s okay!",
      "Not brave enough today, huh?"
    ];
    quoteEN = q[Math.floor(Math.random() * q.length)];
  } else {
    type = "neutral";
    quoteEN = "Hmm, interesting reply 😄";
  }

  const title =
    type === "good"
      ? "✅ 𝐆𝐎𝐎𝐃 𝐀𝐍𝐒𝐖𝐄𝐑"
      : type === "bad"
      ? "❌ 𝐁𝐀𝐃 𝐀𝐍𝐒𝐖𝐄𝐑"
      : "ℹ️ 𝐀𝐍𝐒𝐖𝐄𝐑 𝐑𝐄𝐂𝐄𝐈𝐕𝐄𝐃";

  const msg = `${title}\n` +
    `➤ ${handleReply.authorName}\n` +
    `💬 "${quoteEN}"\n` +
    `💬 Your reply: "${body}"`;

  return api.sendMessage(msg, threadID, messageID);
};
