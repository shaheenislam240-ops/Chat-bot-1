const axios = require("axios");
const simsim = "https://rx-simisimi-api-tllc.onrender.com";

module.exports.config = {
  name: "baby",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "rX",
  description: "AI Chatbot with Teach & List support",
  commandCategory: "chat",
  usages: "[query]",
  cooldowns: 0,
  prefix: false,
};

module.exports.run = async function ({ api, event, args, Users }) {
  const uid = event.senderID;
  const senderName = await Users.getNameUser(uid);

  // Safety: if args is undefined or empty, assign empty array
  args = args || [];
  const query = args.join(" ").toLowerCase();

  try {
    if (args.length === 0) {
      // BASIC CHAT fallback
      const texts = ["Hey baby 💖", "Yes, I'm here 😘"];
      const reply = texts[Math.floor(Math.random() * texts.length)];
      return api.sendMessage(reply, event.threadID);
    }

    // AUTO TEACH ON/OFF
    if (args[0] === "autoteach") {
      const mode = args[1];
      if (!["on", "off"].includes(mode)) {
        return api.sendMessage("✅ Use: baby autoteach on/off", event.threadID, event.messageID);
      }
      const status = mode === "on";
      await axios.post(`${simsim}/setting`, { autoTeach: status });
      return api.sendMessage(`✅ Auto teach is now ${status ? "ON 🟢" : "OFF 🔴"}`, event.threadID, event.messageID);
    }

    // LIST
    if (args[0] === "list") {
      const res = await axios.get(`${simsim}/list`);
      if (!res.data) return api.sendMessage("❌ Failed to fetch list.", event.threadID, event.messageID);

      return api.sendMessage(
        `🤖 Total Questions Learned: ${res.data.totalQuestions || 0}\n💬 Total Replies Stored: ${res.data.totalReplies || 0}\n📚 Developer: rX Abdullah`,
        event.threadID,
        event.messageID
      );
    }

    // MSG
    if (args[0] === "msg") {
      const trigger = args.slice(1).join(" ").trim();
      if (!trigger) return api.sendMessage("❌ | Use: baby msg [trigger]", event.threadID, event.messageID);

      const res = await axios.get(`${simsim}/simsimi-list?ask=${encodeURIComponent(trigger)}`);
      if (!res.data || !Array.isArray(res.data.replies) || res.data.replies.length === 0) {
        return api.sendMessage("❌ No replies found.", event.threadID, event.messageID);
      }

      const formatted = res.data.replies.map((rep, i) => `➤ ${i + 1}. ${rep}`).join("\n");
      const msg = `📌 𝗧𝗿𝗶𝗴𝗴𝗲𝗿: ${trigger.toUpperCase()}\n📋 𝗧𝗼𝘁𝗮𝗹: ${res.data.total || res.data.replies.length}\n━━━━━━━━━━━━━━\n${formatted}`;
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    // TEACH
    if (args[0] === "teach") {
      const parts = query.replace("teach ", "").split(" - ");
      if (parts.length < 2)
        return api.sendMessage("❌ | Use: teach [Question] - [Reply]", event.threadID, event.messageID);

      const [ask, ans] = parts;
      if (!ask || !ans) return api.sendMessage("❌ Question or Reply cannot be empty.", event.threadID, event.messageID);

      const res = await axios.get(
        `${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}`
      );

      if (!res.data || !res.data.message)
        return api.sendMessage("❌ Failed to teach the bot.", event.threadID, event.messageID);

      return api.sendMessage(`✅ ${res.data.message}`, event.threadID, event.messageID);
    }

    // EDIT
    if (args[0] === "edit") {
      const parts = query.replace("edit ", "").split(" - ");
      if (parts.length < 3)
        return api.sendMessage("❌ | Use: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);

      const [ask, oldR, newR] = parts;
      if (!ask || !oldR || !newR)
        return api.sendMessage("❌ Missing parameters for edit command.", event.threadID, event.messageID);

      const res = await axios.get(
        `${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldR)}&new=${encodeURIComponent(newR)}`
      );

      return api.sendMessage(res.data?.message || "❌ Failed to edit reply.", event.threadID, event.messageID);
    }

    // REMOVE
    if (["remove", "rm"].includes(args[0])) {
      const parts = query.replace(/^(remove|rm)\s*/, "").split(" - ");
      if (parts.length < 2)
        return api.sendMessage("❌ | Use: remove [Question] - [Reply]", event.threadID, event.messageID);

      const [ask, ans] = parts;
      if (!ask || !ans) return api.sendMessage("❌ Missing question or reply to remove.", event.threadID, event.messageID);

      const res = await axios.get(
        `${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`
      );

      return api.sendMessage(res.data?.message || "❌ Failed to remove reply.", event.threadID, event.messageID);
    }

    // BASIC CHAT fallback
    if (!query) {
      const texts = ["Hey baby 💖", "Yes, I'm here 😘"];
      const reply = texts[Math.floor(Math.random() * texts.length)];
      return api.sendMessage(reply, event.threadID);
    }

    // Default chat response
    const res = await axios.get(
      `${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`
    );

    if (!res.data || !res.data.response)
      return api.sendMessage("❌ No response from AI.", event.threadID, event.messageID);

    return api.sendMessage(res.data.response, event.threadID, (err, info) => {
      if (!err && info && global.client && Array.isArray(global.client.handleReply)) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi",
        });
      }
    }, event.messageID);
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, Users }) {
  const senderName = await Users.getNameUser(event.senderID);
  if (!event.body) return; // Safety check

  const text = event.body.toLowerCase();

  try {
    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(text)}&senderName=${encodeURIComponent(senderName)}`);
    if (!res.data || !res.data.response) {
      return api.sendMessage("❌ No response from AI.", event.threadID, event.messageID);
    }
    return api.sendMessage(res.data.response, event.threadID, (err, info) => {
      if (!err && info && global.client && Array.isArray(global.client.handleReply)) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi",
        });
      }
    }, event.messageID);
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  if (!event.body) return; // Safety check
  const text = event.body.toLowerCase().trim();
  if (!text) return;

  const senderName = await Users.getNameUser(event.senderID);

  // Triggers for short replies
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
      "আমাকে ডাকলে ,আমি কিন্তু 𝐊𝐢𝐬𝐬 করে দিব 😘",
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    return api.sendMessage(reply, event.threadID, (err, info) => {
      if (!err && info && global.client && Array.isArray(global.client.handleReply)) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi",
        });
      }
    });
  }

  // Commands starting with baby, bot, jan, bbz, maria, hippi
  const matchPrefix = /^(baby|bot|jan|bbz|maria|hippi)\s+/i;
  if (matchPrefix.test(text)) {
    const query = text.replace(matchPrefix, "").trim();
    if (!query) return;

    try {
      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
      if (!res.data || !res.data.response) return;
      return api.sendMessage(res.data.response, event.threadID, (err, info) => {
        if (!err && info && global.client && Array.isArray(global.client.handleReply)) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi",
          });
        }
      }, event.messageID);
    } catch (e) {
      return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
    }
  }

  // AUTO TEACH when replying
  if (event.type === "message_reply") {
    try {
      const setting = await axios.get(`${simsim}/setting`);
      if (!setting.data || !setting.data.autoTeach) return;

      const ask = event.messageReply?.body?.toLowerCase()?.trim();
      const ans = event.body?.toLowerCase()?.trim();

      // Prevent self-teach, empty or duplicate
      if (!ask || !ans || ask === ans) return;
      if (event.messageReply.senderID === global.data.botID) return;

      await axios.get(
        `${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderName=${encodeURIComponent(senderName)}`
      );
    } catch (e) {
      console.log("Auto teach error:", e.message);
    }
  }
};
