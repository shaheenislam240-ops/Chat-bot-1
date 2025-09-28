const axios = require("axios");

let simsim = "";

(async () => {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json");
    if (res.data && res.data.baby) {
      simsim = res.data.baby;
    }
  } catch {}
})();

module.exports.config = {
  name: "mari",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "rX",
  description: "AI Chatbot with Teach & List support + Keyword Match",
  commandCategory: "chat",
  usages: "[query]",
  cooldowns: 0,
  prefix: false
};

// 🔹 getAskReply function
async function getAskReply(message, allList) {
  message = message.toLowerCase().trim();
  if (!message) return null;

  // 1️⃣ Exact match
  const exactRes = allList.find(q => q.ask.toLowerCase() === message);
  if (exactRes) return exactRes.ans;

  // 2️⃣ Keyword/substring match
  const words = message.split(/\s+/);
  for (let word of words) {
    const matched = allList.find(q => q.ask.toLowerCase().includes(word));
    if (matched) return matched.ans;
  }

  // 3️⃣ No match
  return "❌ Not teached yet.";
}

module.exports.run = async function ({ api, event, args, Users }) {
  const uid = event.senderID;
  const senderName = await Users.getNameUser(uid);
  const query = args.join(" ").toLowerCase();

  try {
    if (!simsim) return api.sendMessage("❌ API not loaded yet.", event.threadID, event.messageID);

    if (args[0] === "autoteach") {
      const mode = args[1];
      if (!["on", "off"].includes(mode)) return api.sendMessage("✅ Use: baby autoteach on/off", event.threadID, event.messageID);
      const status = mode === "on";
      await axios.post(`${simsim}/setting`, { autoTeach: status });
      return api.sendMessage(`✅ Auto teach is now ${status ? "ON 🟢" : "OFF 🔴"}`, event.threadID, event.messageID);
    }

    if (args[0] === "list") {
      const res = await axios.get(`${simsim}/list`);
      return api.sendMessage(
        `╭─╼🌟 𝐁𝐚𝐛𝐲 𝐀𝐈 𝐒𝐭𝐚𝐭𝐮𝐬\n├ 📝 𝐓𝐞𝐚𝐜𝐡𝐞𝐝 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧𝐬: ${res.data.totalQuestions}\n├ 📦 𝐒𝐭𝐨𝐫𝐞𝐝 𝐑𝐞𝐩𝐥𝐢𝐞𝐬: ${res.data.totalReplies}\n╰─╼👤 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: 𝐫𝐗 𝐀𝐛𝐝𝐮𝐥𝐥𝐚𝐡`,
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
      const reply = texts[Math.floor(Math.random() * texts.length)];
      return api.sendMessage(reply, event.threadID);
    }

    // 🔹 Main response using getAskReply
    const allListRes = await axios.get(`${simsim}/list?all=1`);
    const reply = await getAskReply(query, allListRes.data.questions);
    return api.sendMessage(reply, event.threadID, event.messageID);

  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, Users }) {
  const senderName = await Users.getNameUser(event.senderID);
  const text = event.body?.toLowerCase();
  if (!text || !simsim) return;

  try {
    const allListRes = await axios.get(`${simsim}/list?all=1`);
    const reply = await getAskReply(text, allListRes.data.questions);
    return api.sendMessage(reply, event.threadID, event.messageID);
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const text = event.body?.toLowerCase().trim();
  if (!text || !simsim) return;
  const senderName = await Users.getNameUser(event.senderID);

  const triggers = ["bebe", "janu", "xan", "bbz", "mari", "arshi"];
  if (triggers.includes(text)) {
    const replies = [
      "𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮 𝐰𝐚𝐥𝐚𝐢𝐤𝐮𝐦 ♥",
      "বলেন sir__😌",
      "𝐁𝐨𝐥𝐨 𝐣𝐚𝐧 𝐤𝐢 𝐤𝐨𝐫𝐭𝐞 𝐩𝐚𝐧𝐧𝐦 𝐭𝐦𝐫 𝐣𝐨𝐧𝐧𝐨 🐸",
      "𝐋𝐞𝐛𝐮 𝐤𝐡𝐚𝐰 𝐝𝐚𝐤𝐭𝐞 𝐝𝐚𝐤𝐭𝐞 𝐭𝐨 𝐡𝐚𝐩𝐚𝐲 𝐠𝐞𝐬𝐨",
      "𝐆𝐚𝐧𝐣𝐚 𝐤𝐡𝐚 𝐦𝐚𝐧𝐮𝐬𝐡 𝐡𝐨 🍁",
      "𝐋𝐞𝐦𝐨𝐧 𝐭𝐮𝐬 🍋",
      "মুড়ি খাও 🫥",
      ".__𝐚𝐦𝐤𝐞 𝐬𝐞𝐫𝐞 𝐝𝐞𝐰 𝐚𝐦𝐢 𝐚𝐦𝐦𝐮𝐫 𝐤𝐚𝐬𝐞 𝐣𝐚𝐛𝐨!!🥺.....😗",
      "লুঙ্গি টা ধর মুতে আসি🙊🙉",
      "──‎ 𝐇𝐮𝐌..? 👉👈",
      "আম গাছে আম নাই ঢিল কেন মারো, তোমার সাথে প্রেম নাই বেবি কেন ডাকো 😒🐸",
      "কি হলো, মিস টিস করচ্ছো নাকি 🤣",
      "𝐓𝐫𝐮𝐬𝐭 𝐦𝐞 𝐢𝐚𝐦 𝐦𝐚𝐫𝐢𝐚 🧃",
      "𝐇ᴇʏ 𝐗ᴀɴ 𝐈’ᴍ 𝐌ᴀʀɪᴀ 𝐁ᴀʙʏ✨"
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    return api.sendMessage(reply, event.threadID);
  }

  const matchPrefix = /^(bebe|janu|xan|bbz|mari|arshi)\s+/i;
  if (matchPrefix.test(text)) {
    const query = text.replace(matchPrefix, "").trim();
    if (!query) return;

    try {
      const allListRes = await axios.get(`${simsim}/list?all=1`);
      const reply = await getAskReply(query, allListRes.data.questions);
      return api.sendMessage(reply, event.threadID);
    } catch (e) {
      return api.sendMessage(`❌ Error: ${e.message}`, event.threadID);
    }
  }
};
