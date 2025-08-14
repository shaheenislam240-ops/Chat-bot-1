const axios = require("axios");

// GitHub raw JSON URL যেখানে mentionapi key আছে
const GITHUB_API_URL = "https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json";

let mentionApiUrl = "";

// ===== Fetch mentionapi URL from GitHub =====
async function fetchMentionAPI() {
  try {
    const res = await axios.get(GITHUB_API_URL);
    mentionApiUrl = res.data?.mentionapi || "";
  } catch (err) {
    mentionApiUrl = "";
    console.error("❌ Could not fetch mentionapi URL:", err.message);
  }
}

module.exports.config = {
  name: "babyteach",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Teach, reply & delete system via mentionapi API only (mention user in reply)",
  commandCategory: "noprefix",
  usages: "!teach <trigger> - <reply>, !delteach <trigger>",
  cooldowns: 0
};

// ===== Reply system (normal triggers with mention) =====
module.exports.handleEvent = async function ({ api, event, Users }) {
  if (!event.body) return;
  const text = event.body.trim();

  await fetchMentionAPI();
  if (!mentionApiUrl) return;

  try {
    const res = await axios.get(`${mentionApiUrl}/reply/${encodeURIComponent(text)}`);
    if (res.data?.reply) {
      const name = await Users.getNameUser(event.senderID);

      const message = `@${name} ${res.data.reply}`;
      const mentions = [{
        tag: `@${name}`,
        id: event.senderID,
        fromIndex: 0,
        length: name.length + 1
      }];

      return api.sendMessage({ body: message, mentions }, event.threadID, event.messageID);
    }
  } catch (_) {
    // silently fail
  }
};

// ===== Teach / Delete commands via mentionapi API =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const content = args.join(" ").trim();

  await fetchMentionAPI();
  if (!mentionApiUrl) return api.sendMessage("❌ mentionapi not available", threadID, messageID);

  // ===== Teach =====
  if (event.body.startsWith("!teach ")) {
    const parts = content.split(" - ");
    if (parts.length < 2) return api.sendMessage("❌ Format: !teach <trigger> - <reply>", threadID, messageID);

    const trigger = parts[0].trim();
    const reply = parts[1].trim();

    try {
      const res = await axios.post(`${mentionApiUrl}/teach`, { trigger, reply });
      const msg = res.data?.message || `✅ Trigger saved: "${trigger}"`;
      return api.sendMessage(msg, threadID, messageID);
    } catch (err) {
      return api.sendMessage(`❌ API error: ${err.response?.data?.message || err.message}`, threadID, messageID);
    }
  }

  // ===== Delete =====
  if (event.body.startsWith("!delteach ")) {
    const trigger = content.trim();
    try {
      const res = await axios.delete(`${mentionApiUrl}/delete/${encodeURIComponent(trigger)}`);
      const msg = res.data?.message || `🗑 Trigger deleted: "${trigger}"`;
      return api.sendMessage(msg, threadID, messageID);
    } catch (err) {
      return api.sendMessage(`❌ API error: ${err.response?.data?.message || err.message}`, threadID, messageID);
    }
  }
};
