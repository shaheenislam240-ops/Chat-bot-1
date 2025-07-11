const axios = require("axios");
const simsim = "https://rx-simisimi-api.onrender.com";

module.exports.config = {
  name: "baby",
  version: "1.0.2",
  hasPermission: 0,
  credits: "rX",
  description: "Teachable Baby AI",
  commandCategory: "simsimi",
  usages: "[message | teach | list | edit | remove]",
  cooldowns: 0,
  prefix: false
};

module.exports.run = async function ({ api, event, args, Users }) {
  const uid = event.senderID;
  const senderName = await Users.getNameUser(uid);
  const query = args.join(" ").toLowerCase();

  if (!query) {
    return api.sendMessage("💬 কিছু লিখো বেবি 🥺", event.threadID, event.messageID);
  }

  if (args[0] === "teach") {
    const parts = query.replace("teach ", "").split(" - ");
    if (parts.length < 2)
      return api.sendMessage("❌ | Use: teach [Question] - [Reply]", event.threadID, event.messageID);
    const [ask, ans] = parts;
    const res = await axios.get(`${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
    return api.sendMessage(`✅ ${res.data.message}`, event.threadID, event.messageID);
  }

  if (args[0] === "edit") {
    const parts = query.replace("edit ", "").split(" - ");
    if (parts.length < 3)
      return api.sendMessage("❌ | Use: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);
    const [ask, oldReply, newReply] = parts;
    const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
    return api.sendMessage(res.data.message, event.threadID, event.messageID);
  }

  if (["remove", "rm"].includes(args[0])) {
    const parts = query.replace(/^(remove|rm)\s*/, "").split(" - ");
    if (parts.length < 2)
      return api.sendMessage("❌ | Use: remove [Question] - [Reply]", event.threadID, event.messageID);
    const [ask, ans] = parts;
    const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
    return api.sendMessage(res.data.message, event.threadID, event.messageID);
  }

  if (args[0] === "list") {
    const trigger = args.slice(1).join(" ").trim();
    if (!trigger) {
      return api.sendMessage("📌 ট্রিগার দিন!\nউদাহরণ: !baby list jan", event.threadID, event.messageID);
    }

    try {
      const res = await axios.get(`${simsim}/simsimi-list?ask=${encodeURIComponent(trigger)}`);
      const data = res.data;

      if (data.message?.includes("No replies")) {
        return api.sendMessage(`❌ "${trigger}" এর কোনো রিপ্লাই খুঁজে পাইনি`, event.threadID, event.messageID);
      }

      const replies = data.replies.map((r, i) => `${i + 1}. ${r}`).join("\n");
      const fancyTrigger = trigger.toUpperCase();

      return api.sendMessage(
        `📌 𝗧𝗿𝗶𝗴𝗴𝗲𝗿: ${fancyTrigger}\n📋 𝗧𝗼𝘁𝗮𝗹: ${data.total}\n━━━━━━━━━━━━━━\n${replies}`,
        event.threadID,
        event.messageID
      );
    } catch {
      return api.sendMessage("❌ লিস্ট আনতে সমস্যা হচ্ছে!", event.threadID, event.messageID);
    }
  }

  try {
    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
    const reply = Array.isArray(res.data.response) ? res.data.response[0] : res.data.response;
    return api.sendMessage(reply, event.threadID, event.messageID);
  } catch {
    return api.sendMessage("❌ সমস্যা হচ্ছে, পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const text = event.body?.toLowerCase().trim();
  if (!text) return;

  const callWords = ["baby", "jan", "maria", "bbz", "bot", "বট", "বেবি"];
  if (callWords.includes(text)) {
    const replies = [
      "হুম জান, বলো আমি আছি 🥰",
      "জান বলো কী হয়েছে? 💞",
      "বলো না জানু, কানে কানে বলো 🥺",
      "তুমি ডাকলেই আমি চলে আসি 🌸",
      "ডাকিস না পড়তে বসসি 🙈",
      "কী বেবি 😘"
    ];
    const res = replies[Math.floor(Math.random() * replies.length)];
    return api.sendMessage(res, event.threadID, event.messageID);
  }
};
