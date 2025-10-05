const axios = require("axios");

module.exports.config = {
  name: "truthordare",
  version: "2.2.0",
  hasPermssion: 0,
  credits: "rX Abdullah + ChatGPT",
  description: "Play truth or dare using questions from your Render API and SimSimi for replies",
  commandCategory: "fun",
  usages: "[optional: truth/dare]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  const name = await Users.getNameUser(senderID);

  // ✅ Render API URL for Truth or Dare
  const baseAPI = "https://true-false-api-9cq3.onrender.com/truthdare";

  // Determine type: truth or dare
  const typeInput = args[0]?.toLowerCase();
  const type = typeInput === "truth" || typeInput === "dare"
    ? typeInput
    : Math.random() < 0.5
      ? "truth"
      : "dare";

  // Countdown messages
  const countdown = [
    { text: "⏳ 3...", delay: 1000 },
    { text: "⏳ 2...", delay: 2000 },
    { text: "⏳ 1...", delay: 3000 },
    { text: "🎉 Ready!", delay: 4000 }
  ];

  // Send countdown
  for (const step of countdown) {
    setTimeout(() => api.sendMessage(step.text, threadID), step.delay);
  }

  // After countdown, fetch question
  setTimeout(async () => {
    try {
      const res = await axios.get(`${baseAPI}/${type}`, { timeout: 10000 });
      console.log("DEBUG: API response:", res.data);

      const question = res.data?.question || "⚠️ Couldn't get question from API.";

      const msg = `${type === "truth" ? "🟢 𝗧𝗥𝗨𝗧𝗛 𝗧𝗜𝗠𝗘" : "🔴 𝗗𝗔𝗥𝗘 𝗧𝗜𝗠𝗘"}\n` +
        `➤ ${name}, ${type === "truth" ? "answer this question honestly" : "complete this dare"}:\n` +
        `${question}\n\n💬 Reply to this message with your ${type === "truth" ? "answer" : "proof"}.`;

      api.sendMessage(msg, threadID, (err, info) => {
        if (err) console.error("DEBUG: sendMessage error:", err);

        // Save handleReply for user's response
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

// ✅ Handle user reply using SimSimi API
module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;

  if (senderID !== handleReply.author)
    return api.sendMessage("🚫 Only the selected player can reply to this!", threadID, messageID);

  let simsimiReply = "";

  try {
    // Call SimSimi API
    const res = await axios.get("https://rx-simisimi-api-tllc.onrender.com", {
      params: { text: body },
      timeout: 10000
    });

    simsimiReply = res.data?.response || "🤖 SimSimi didn’t answer this time!";
  } catch (err) {
    console.error("DEBUG: SimSimi API error:", err.message);
    simsimiReply = "⚠️ Failed to fetch reply from SimSimi.";
  }

  const msg = `ℹ️ 𝐀𝐍𝐒𝐖𝐄𝐑 𝐑𝐄𝐂𝐄𝐈𝐕𝐄𝐃\n` +
    `➤ ${handleReply.authorName}\n` +
    `💬 "${simsimiReply}"\n` +
    `💬 Your reply: "${body}"`;

  return api.sendMessage(msg, threadID, messageID);
};
