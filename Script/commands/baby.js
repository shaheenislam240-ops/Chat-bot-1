const axios = require("axios");
require("dotenv").config();

const API_BASE = "https://rx-api-m2ko.onrender.com";

const emojis = ['🥰','😊','😽','😍','😘','💖','💙','💜','🌟','✨'];
const fixedTriggers = ['sona', 'abdullah', 'baby', 'maria', 'bbz', 'bby'];

const removeEmojis = text => text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD800-\uDFFF]|[\uFE00-\uFE0F]|[\u200D])/g, '').trim();

async function apiCall(endpoint, params) {
  try {
    const res = await axios.get(`${API_BASE}/${endpoint}`, { params });
    return res.data;
  } catch {
    return null;
  }
}

module.exports = {
  config: {
    name: "baby",
    version: "1.0.12",
    hasPermssion: 0,
    credits: "rX",
    description: "Baby bot using API (no mention, clean reply)",
  },

  onStart: async function({ message, api }) {
    const contentRaw = (message.body || "").toLowerCase().trim();
    if (!contentRaw) return;

    if (message.messageReply && message.messageReply.senderID === api.getCurrentUserID()) {
      const data = await apiCall("", { text: contentRaw });
      const reply = data?.response || "Sorry, kichu bujhte pari nai.";
      return api.sendMessage(reply, message.threadID, message.messageID);
    }

    if (fixedTriggers.includes(contentRaw)) {
      const data = await apiCall("", { text: contentRaw });
      let reply = data?.response || "Sorry, kichu bujhte pari nai.";
      const countEmoji = Math.floor(Math.random() * 2);
      for (let i = 0; i < countEmoji; i++) {
        reply += " " + emojis[Math.floor(Math.random() * emojis.length)];
      }
      return api.sendMessage(reply, message.threadID, message.messageID);
    }

    const data = await apiCall("", { text: contentRaw });
    const reply = data?.response || "Sorry, kichu bujhte pari nai.";
    return api.sendMessage(reply, message.threadID, message.messageID);
  },

  onCall: async function({ event, api }) {
    const { body, threadID } = event;
    if (!body) return;

    const lower = body.toLowerCase();

    if (lower.startsWith("!baby teach ")) {
      const cmd = body.slice(12).trim();
      const sepIndex = cmd.indexOf(" - ");
      if (sepIndex === -1) return api.sendMessage("❌ Format: !baby teach trigger - reply1 - reply2 ...", threadID);

      const trigger = cmd.slice(0, sepIndex).toLowerCase().trim();
      const repliesRaw = cmd.slice(sepIndex + 3).split("-").map(r => r.trim()).filter(Boolean);
      if (!trigger || repliesRaw.length === 0) return api.sendMessage("❌ Trigger and replies required", threadID);

      const data = await apiCall("teach", { ask: trigger, ans: repliesRaw.join(" - "), senderName: event.senderName });
      return api.sendMessage(data?.message || "❌ Teach failed", threadID);
    }

    if (lower.startsWith("!baby edit ")) {
      const cmd = body.slice(10).trim();
      const parts = cmd.split(" - ");
      if (parts.length !== 3) return api.sendMessage("❌ Format: !baby edit trigger - old reply - new reply", threadID);

      const [trigger, oldReply, newReply] = parts.map(p => p.trim());
      if (!trigger || !oldReply || !newReply) return api.sendMessage("❌ All fields required", threadID);

      const data = await apiCall("edit", { ask: trigger.toLowerCase(), old: oldReply, new: newReply });
      return api.sendMessage(data?.message || "❌ Edit failed", threadID);
    }

    if (lower.startsWith("!baby delete ")) {
      const cmd = body.slice(12).trim();
      const sepIndex = cmd.indexOf(" - ");
      if (sepIndex === -1) return api.sendMessage("❌ Format: !baby delete trigger - reply", threadID);

      const trigger = cmd.slice(0, sepIndex).toLowerCase().trim();
      const replyToDelete = cmd.slice(sepIndex + 3).trim();
      if (!trigger || !replyToDelete) return api.sendMessage("❌ Trigger and reply required", threadID);

      const data = await apiCall("delete", { ask: trigger, ans: replyToDelete });
      return api.sendMessage(data?.message || "❌ Delete failed", threadID);
    }

    if (lower === "!baby list") {
      const data = await apiCall("list", {});
      if (!data) return api.sendMessage("❌ Failed to fetch list", threadID);
      const msg = `📋 Total Triggers: ${data.totalQuestions || 0}\n📌 Total Replies: ${data.totalReplies || 0}`;
      return api.sendMessage(msg, threadID);
    }
  }
};
