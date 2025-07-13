const axios = require("axios");
const simsim = "https://rx-simisimi-api.onrender.com";

module.exports.config = {
  name: "baby",
  version: "1.0.7",
  hasPermssion: 0,
  credits: "rX + Modified by Abdullah",
  description: "AI chatbot with custom trigger (sona)",
  commandCategory: "chat",
  usages: "[query]",
  cooldowns: 0,
  prefix: false
};

const sonaReplies = [
  "কি রে সোনা, মন খারাপ নাকি? 😘",
  "সোনা বললি আর না শুনি পারি? বলো 🥺",
  "এই যে সোনা, কি করছো তুমি? 💖",
  "হুমম বলো সোনা 🌸",
  "তোমার ডাকেই মনটা ভরে যায় সোনা 💕"
];

let lastSonaMessageID = {};

module.exports.run = async function ({ api, event, args, Users }) {
  const uid = event.senderID;
  const senderName = await Users.getNameUser(uid);
  const query = args.join(" ").toLowerCase();

  try {
    if (query === "sona") {
      const reply = sonaReplies[Math.floor(Math.random() * sonaReplies.length)];
      return api.sendMessage({
        body: `@${senderName} ${reply}`,
        mentions: [{ tag: `@${senderName}`, id: uid }]
      }, event.threadID, (err, info) => {
        if (!err) {
          lastSonaMessageID[event.threadID] = info.messageID;
        }
      }, event.messageID);
    }

    if (args[0] === "list") {
      const res = await axios.get(`${simsim}/list`);
      return api.sendMessage(
        `🤖 Total Questions Learned: ${res.data.totalQuestions}\n💬 Total Replies Stored: ${res.data.totalReplies}\n📚 Developer: rX Abdullah`,
        event.threadID,
        event.messageID
      );
    }

    if (args[0] === "msg") {
      const trigger = query.replace("msg ", "").trim();
      if (!trigger) return api.sendMessage("❌ | Use: !baby msg [trigger]", event.threadID, event.messageID);
      const res = await axios.get(`${simsim}/simsimi-list?ask=${encodeURIComponent(trigger)}`);
      if (!res.data.replies || res.data.replies.length === 0) {
        return api.sendMessage("❌ No replies found.", event.threadID, event.messageID);
      }
      const formatted = res.data.replies.map((rep, i) => `${i + 1}. ${rep}`).join("\n");
      return api.sendMessage(
        `📌 𝗧𝗿𝗶𝗴𝗴𝗲𝗿: ${trigger.toUpperCase()}\n📋 𝗧𝗼𝘁𝗮𝗹: ${res.data.total}\n━━━━━━━━━━━━━━\n${formatted}`,
        event.threadID,
        event.messageID
      );
    }

    if (args[0] === "teach") {
      const parts = query.replace("teach ", "").split(" - ");
      if (parts.length < 2) return api.sendMessage("❌ | Use: teach [Question] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts;
      const res = await axios.get(`${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}`);
      return api.sendMessage(`✅ ${res.data.message}`, event.threadID, event.messageID);
    }

    if (args[0] === "edit") {
      const parts = query.replace("edit ", "").split(" - ");
      if (parts.length < 3) return api.sendMessage("❌ | Use: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);
      const [ask, oldR, newR] = parts;
      const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldR)}&new=${encodeURIComponent(newR)}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (["remove", "rm"].includes(args[0])) {
      const parts = query.replace(/^(remove|rm)\s*/, "").split(" - ");
      if (parts.length < 2) return api.sendMessage("❌ | Use: remove [Question] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts;
      const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (!query) {
      const texts = ["Hey baby 💖", "Yes, I'm here 😘"];
      return api.sendMessage(texts[Math.floor(Math.random() * texts.length)], event.threadID);
    }

    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
    return api.sendMessage(res.data.response, event.threadID, event.messageID);
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const text = event.body?.toLowerCase().trim();
  if (!text) return;
  const senderName = await Users.getNameUser(event.senderID);

  if (text === "sona") {
    const reply = sonaReplies[Math.floor(Math.random() * sonaReplies.length)];
    return api.sendMessage({
      body: `@${senderName} ${reply}`,
      mentions: [{ tag: `@${senderName}`, id: event.senderID }]
    }, event.threadID, (err, info) => {
      if (!err) {
        lastSonaMessageID[event.threadID] = info.messageID;
      }
    }, event.messageID);
  }

  const isReplyToSona = event.messageReply && event.messageReply.messageID === lastSonaMessageID[event.threadID];
  if (isReplyToSona) {
    try {
      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(text)}&senderName=${encodeURIComponent(senderName)}`);
      return api.sendMessage(res.data.response, event.threadID, event.messageID);
    } catch (e) {
      return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
    }
  }

  const triggers = ["baby", "bby", "jan", "bbz", "maria", "hippi"];
  if (triggers.includes(text)) {
    const replies = [
      "Yes baby, I'm here 🥰",
      "Tell me 💞",
      "Say it 🥺",
      "You called? 🌸",
      "What happened? 😘"
    ];
    return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID);
  }

  const matchPrefix = /^(baby|bot|jan|bbz|maria|hippi)\s+/i;
  if (matchPrefix.test(text)) {
    const query = text.replace(matchPrefix, "").trim();
    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
    return api.sendMessage(res.data.response, event.threadID, event.messageID);
  }
};
