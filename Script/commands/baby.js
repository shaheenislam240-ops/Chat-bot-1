const axios = require("axios");
const simsim = "https://rx-simisimi-api-tllc.onrender.com";

// 🧹 Function to remove emoji/symbols
function cleanMessage(message) {
  return message.replace(/[^\p{L}\p{N}\s]/gu, "").trim().toLowerCase();
}

module.exports.config = {
  name: "baby",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "rX + Maria (clean fix)",
  description: "AI Chatbot with Teach & List support",
  commandCategory: "chat",
  usages: "[query]",
  cooldowns: 0,
  prefix: false
};

module.exports.run = async function ({ api, event, args, Users }) {
  const uid = event.senderID;
  const senderName = await Users.getNameUser(uid);
  const rawInput = args.join(" ");
  const query = cleanMessage(rawInput);

  try {
    if (args[0] === "autoteach") {
      const mode = args[1];
      if (!["on", "off"].includes(mode)) {
        return api.sendMessage("✅ Use: baby autoteach on/off", event.threadID, event.messageID);
      }
      const status = mode === "on";
      await axios.post(`${simsim}/setting`, { autoTeach: status });
      return api.sendMessage(`✅ Auto teach is now ${status ? "ON 🟢" : "OFF 🔴"}`, event.threadID, event.messageID);
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
      const trigger = cleanMessage(rawInput.replace("msg ", "").trim());
      if (!trigger) return api.sendMessage("❌ | Use: !baby msg [trigger]", event.threadID, event.messageID);

      const res = await axios.get(`${simsim}/simsimi-list?ask=${encodeURIComponent(trigger)}`);
      if (!res.data.replies || res.data.replies.length === 0) {
        return api.sendMessage("❌ No replies found.", event.threadID, event.messageID);
      }

      const formatted = res.data.replies.map((rep, i) => `${i + 1}. ${rep}`).join("\n");
      const msg = `📌 𝗧𝗿𝗶𝗴𝗴𝗲𝗿: ${trigger.toUpperCase()}\n📋 𝗧𝗼𝘁𝗮𝗹: ${res.data.total}\n━━━━━━━━━━━━━━\n${formatted}`;
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    if (args[0] === "teach") {
      const parts = rawInput.replace("teach ", "").split(" - ");
      if (parts.length < 2)
        return api.sendMessage("❌ | Use: teach [Question] - [Reply]", event.threadID, event.messageID);

      const [askRaw, ansRaw] = parts;
      const ask = cleanMessage(askRaw);
      const ans = ansRaw.trim();

      const res = await axios.post(`${simsim}/teach`, {
        ask,
        ans,
        senderID: uid,
        senderName
      });

      return api.sendMessage(`✅ ${res.data.message}`, event.threadID, event.messageID);
    }

    if (args[0] === "edit") {
      const parts = rawInput.replace("edit ", "").split(" - ");
      if (parts.length < 3)
        return api.sendMessage("❌ | Use: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);

      const [askRaw, oldR, newR] = parts;
      const ask = cleanMessage(askRaw);

      const res = await axios.post(`${simsim}/edit`, {
        ask,
        old: oldR.trim(),
        new: newR.trim()
      });

      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (["remove", "rm"].includes(args[0])) {
      const parts = rawInput.replace(/^(remove|rm)\s*/, "").split(" - ");
      if (parts.length < 2)
        return api.sendMessage("❌ | Use: remove [Question] - [Reply]", event.threadID, event.messageID);

      const [askRaw, ansRaw] = parts;
      const ask = cleanMessage(askRaw);
      const ans = ansRaw.trim();

      const res = await axios.post(`${simsim}/delete`, { ask, ans });
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (!query) {
      const texts = ["Hey baby 💖", "Yes, I'm here 😘"];
      const reply = texts[Math.floor(Math.random() * texts.length)];
      return api.sendMessage(reply, event.threadID);
    }

    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
    return api.sendMessage(res.data.response, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi"
        });
      }
    }, event.messageID);
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, Users }) {
  const senderName = await Users.getNameUser(event.senderID);
  const text = cleanMessage(event.body || "");
  if (!text) return;

  try {
    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(text)}&senderName=${encodeURIComponent(senderName)}`);
    return api.sendMessage(res.data.response, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi"
        });
      }
    }, event.messageID);
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const text = cleanMessage(event.body || "");
  if (!text) return;

  const senderName = await Users.getNameUser(event.senderID);

  const triggers = ["baby", "bby", "xan", "bbz", "maria", "hippi"];
  if (triggers.includes(text)) {
    const replies = [
      "𝘼𝙨𝙨𝙖𝙡𝙖𝙢𝙪𝙖𝙡𝙖𝙞𝙠𝙪𝙢♥",
      "বলেন sir__😌",
      "𝙇𝙚𝙢𝙤𝙣 𝙩𝙪𝙨 🍋",
      "𝙈𝙪𝙧𝙞 𝙠𝙝𝙖 🤌🫥",
      "কি হলো, মিস টিস করচ্ছো নাকি 🤣",
      "𝘽𝙤𝙡𝙤 𝙗𝙖𝙗𝙮 🥹",
      "৮১ , ৮২ , ৮৩ আমি তোমাকে ভালবাসি",
      "আমাকে ডাকলে ,আমি কিন্তু 𝐊𝐢𝐬𝐬 করে দিব 😘"
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    return api.sendMessage(reply, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi"
        });
      }
    });
  }

  const matchPrefix = /^(baby|bot|jan|bbz|maria|hippi)\s+/i;
  if (matchPrefix.test(text)) {
    const query = cleanMessage(text.replace(matchPrefix, "").trim());
    if (!query) return;

    try {
      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
      return api.sendMessage(res.data.response, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      }, event.messageID);
    } catch (e) {
      return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
    }
  }

  if (event.type === "message_reply") {
    try {
      const setting = await axios.get(`${simsim}/setting`);
      if (!setting.data.autoTeach) return;

      const ask = cleanMessage(event.messageReply.body || "");
      const ans = cleanMessage(event.body || "");
      if (!ask || !ans || ask === ans) return;

      await axios.post(`${simsim}/teach`, {
        ask,
        ans,
        senderName
      });
    } catch (e) {
      console.log("Auto teach error:", e.message);
    }
  }
};
