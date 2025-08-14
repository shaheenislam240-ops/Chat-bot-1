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
  version: "2.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Teach, reply & delete system via mentionapi API",
  commandCategory: "noprefix",
  usages: "!teach <trigger> - <reply>, !delteach <trigger>",
  cooldowns: 0
};

// ===== Reply system =====
module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;
  const text = event.body.trim();

  await fetchMentionAPI();
  if (!mentionApiUrl) return;

  try {
    const res = await axios.get(`${mentionApiUrl}/reply/${encodeURIComponent(text)}`);
    if (res.data?.reply) {
      return api.sendMessage(res.data.reply, event.threadID, event.messageID);
    }
  } catch (_) {
    // silently fail
  }
};

// ===== Teach / Delete commands via mentionapi API =====
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const content = args.join(" ");

  await fetchMentionAPI();
  if (!mentionApiUrl) return api.sendMessage("❌ mentionapi not available", threadID, messageID);

  // ===== Teach =====
  if (event.body.startsWith("!teach ")) {
    const parts = content.split(" - ");
    if (parts.length < 2) {
      return api.sendMessage("❌ Format: !teach <trigger> - <reply>", threadID, messageID);
    }
    const trigger = parts[0].trim();
    const reply = parts[1].trim();

    try {
      const res = await axios.post(`${mentionApiUrl}/teach`, { trigger, reply });
      if (res.data?.success) {
        return api.sendMessage(`✅ Taught: "${trigger}" → "${reply}"`, threadID, messageID);
      } else {
        return api.sendMessage(`⚠ Failed to teach: ${res.data?.message || "Unknown error"}`, threadID, messageID);
      }
    } catch (err) {
      return api.sendMessage(`❌ API error: ${err.message}`, threadID, messageID);
    }
  }

  // ===== Delete =====
  if (event.body.startsWith("!delteach ")) {
    const trigger = content.trim();
    try {
      const res = await axios.delete(`${mentionApiUrl}/delete/${encodeURIComponent(trigger)}`);
      if (res.data?.success) {
        return api.sendMessage(`🗑 Deleted trigger: "${trigger}"`, threadID, messageID);
      } else {
        return api.sendMessage(`⚠ Failed to delete: ${res.data?.message || "Not found"}`, threadID, messageID);
      }
    } catch (err) {
      return api.sendMessage(`❌ API error: ${err.message}`, threadID, messageID);
    }
  }
};
