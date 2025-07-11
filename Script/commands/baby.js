const axios = require("axios");
const simsim = "https://rx-simisimi-api.onrender.com";

module.exports.config = {
  name: "baby",
  version: "1.0.6",
  hasPermission: 0,
  credits: "rX Abdullah",
  description: "Teachable Baby AI with teach, list, edit, remove & msg features",
  commandCategory: "simsim",
  usages: "[message | teach | list | edit | remove | msg]",
  cooldowns: 0,
  prefix: false,
};

module.exports.run = async function ({ api, event, args, Users }) {
  const uid = event.senderID;
  const senderName = await Users.getNameUser(uid);
  const query = args.join(" ").toLowerCase();

  if (!query) {
    return api.sendMessage("💬 কিছু লিখো বেবি 🥺", event.threadID, event.messageID);
  }

  if (args[0] === "teach") {
    const parts = query.replace("teach ", "").split(" - ").map(s => s.trim()).filter(Boolean);
    if (parts.length < 2)
      return api.sendMessage("❌ | Use: teach [Trigger] - [Reply1] - [Reply2] - ...", event.threadID, event.messageID);
    const trigger = parts[0];
    const replies = parts.slice(1);

    try {
      const res = await axios.get(`${simsim}/teach?ask=${encodeURIComponent(trigger)}&ans=${encodeURIComponent(replies.join(" - "))}`);
      return api.sendMessage(`✅ ${res.data.message}`, event.threadID, event.messageID);
    } catch {
      return api.sendMessage("❌ Teach করতে সমস্যা হচ্ছে!", event.threadID, event.messageID);
    }
  }

  if (args[0] === "msg") {
    const trigger = args.slice(1).join(" ").trim();

    if (!trigger) {
      try {
        const res = await axios.get(`${simsim}/list`);
        if (res.data.code === 200) {
          return api.sendMessage(
            `🤖 Total Questions Learned: ${res.data.totalQuestions}\n💬 Total Replies Stored: ${res.data.totalReplies}\n📚 Developer: rX Abdullah`,
            event.threadID,
            event.messageID
          );
        } else {
          return api.sendMessage(`❌ Error: ${res.data.message || "Failed to fetch list"}`, event.threadID, event.messageID);
        }
      } catch {
        return api.sendMessage("❌ Error fetching data, try again later.", event.threadID, event.messageID);
      }
    }

    try {
      const res = await axios.get(`${simsim}/simsimi-list?ask=${encodeURIComponent(trigger)}`);
      if (res.data.message?.includes("No replies")) {
        return api.sendMessage(`❌ "${trigger}" এর কোনো রিপ্লাই পাওয়া যায়নি।`, event.threadID, event.messageID);
      }
      const total = res.data.total || 0;
      return api.sendMessage(`📌 "${trigger}" এ মোট ${total} টি রিপ্লাই সিখানো আছে।`, event.threadID, event.messageID);
    } catch {
      return api.sendMessage("❌ রিপ্লাই লিস্ট আনতে সমস্যা হচ্ছে!", event.threadID, event.messageID);
    }
  }

  if (args[0] === "list") {
    try {
      const res = await axios.get(`${simsim}/list`);
      if (res.data.code === 200) {
        return api.sendMessage(
          `🤖 Total Questions Learned: ${res.data.totalQuestions}\n💬 Total Replies Stored: ${res.data.totalReplies}\n📚 Developer: rX Abdullah`,
          event.threadID,
          event.messageID
        );
      } else {
        return api.sendMessage(`❌ Error: ${res.data.message || "Failed to fetch list"}`, event.threadID, event.messageID);
      }
    } catch {
      return api.sendMessage("❌ Error fetching data, try again later.", event.threadID, event.messageID);
    }
  }

  if (args[0] === "edit") {
    const parts = query.replace("edit ", "").split(" - ").map(s => s.trim()).filter(Boolean);
    if (parts.length < 3)
      return api.sendMessage("❌ | Use: edit [Trigger] - [OldReply] - [NewReply]", event.threadID, event.messageID);
    const [trigger, oldReply, newReply] = parts;
    try {
      const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(trigger)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    } catch {
      return api.sendMessage("❌ Edit করতে সমস্যা হচ্ছে!", event.threadID, event.messageID);
    }
  }

  if (["remove", "rm"].includes(args[0])) {
    const parts = query.replace(/^(remove|rm)\s*/, "").split(" - ").map(s => s.trim()).filter(Boolean);
    if (parts.length < 2)
      return api.sendMessage("❌ | Use: remove [Trigger] - [Reply]", event.threadID, event.messageID);
    const [trigger, ans] = parts;
    try {
      const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(trigger)}&ans=${encodeURIComponent(ans)}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    } catch {
      return api.sendMessage("❌ Delete করতে সমস্যা হচ্ছে!", event.threadID, event.messageID);
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
    const defaultReplies = [
      "হুম জান, বলো আমি আছি 🥰",
      "জান বলো কী হয়েছে? 💞",
      "বলো না জানু, কানে কানে বলো 🥺",
      "তুমি ডাকলেই আমি চলে আসি 🌸",
      "ডাকিস না পড়তে বসসি 🙈",
      "কী বেবি 😘"
    ];

    if (event.messageReply) {
      const senderName = await Users.getNameUser(event.senderID);
      try {
        const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(text)}&senderName=${encodeURIComponent(senderName)}`);
        const reply = Array.isArray(res.data.response) ? res.data.response[0] : res.data.response;
        return api.sendMessage(reply, event.threadID, event.messageID);
      } catch {
        return api.sendMessage("❌ সমস্যা হচ্ছে, পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
      }
    } else {
      const res = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
      return api.sendMessage(res, event.threadID, event.messageID);
    }
  }
};
