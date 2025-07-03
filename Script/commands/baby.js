const axios = require('axios');

const baseApiUrl = async () => {
  const res = await axios.get('https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json');
  return res.data.api;
};

module.exports.config = {
  name: "baby",
  version: "1.0.0",
  credits: "Md Abdullah",
  description: "User wise teachable chat bot",
  commandCategory: "chat",
  cooldowns: 0,
  hasPermssion: 0,
  usePrefix: true,
  prefix: true,
  usages: "[text] OR teach [trigger] - [reply1], [reply2]... OR remove [trigger] OR edit [trigger] - [new reply]"
};

module.exports.run = async function({ api, event, args }) {
  try {
    const uid = event.senderID;
    const link = await baseApiUrl() + "/baby";
    const input = args.join(" ").toLowerCase();

    if (!args[0]) return api.sendMessage("কি বলবে আমাকে?", event.threadID, event.messageID);

    if (args[0] === "teach") {
      const rest = input.slice(6).trim();
      const [trigger, replies] = rest.split(" - ");
      if (!trigger || !replies) return api.sendMessage("Format: teach [trigger] - [reply1], [reply2]...", event.threadID, event.messageID);
      const res = await axios.get(`${link}?teach=${encodeURIComponent(trigger.trim())}&reply=${encodeURIComponent(replies.trim())}&senderID=${uid}`);
      return api.sendMessage(`✅ শেখানো শেষ!\nTrigger: "${trigger.trim()}"\nReplies: ${replies.trim()}`, event.threadID, event.messageID);
    }

    if (args[0] === "remove") {
      const trigger = input.slice(7).trim();
      if (!trigger) return api.sendMessage("Remove করার জন্য trigger দিন!", event.threadID, event.messageID);
      const check = await axios.get(`${link}?check=${encodeURIComponent(trigger)}&senderID=${uid}`);
      if (!check.data.allowed) return api.sendMessage("❌ এটা আপনি শেখাননি, তাই মুছতে পারবেন না!", event.threadID, event.messageID);
      const res = await axios.get(`${link}?remove=${encodeURIComponent(trigger)}&senderID=${uid}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (args[0] === "edit") {
      const rest = input.slice(5).trim();
      const [trigger, newReply] = rest.split(" - ");
      if (!trigger || !newReply) return api.sendMessage("Format: edit [trigger] - [new reply]", event.threadID, event.messageID);
      const check = await axios.get(`${link}?check=${encodeURIComponent(trigger.trim())}&senderID=${uid}`);
      if (!check.data.allowed) return api.sendMessage("❌ এটা আপনি শেখাননি, তাই edit করতে পারবেন না!", event.threadID, event.messageID);
      const res = await axios.get(`${link}?edit=${encodeURIComponent(trigger.trim())}&replace=${encodeURIComponent(newReply.trim())}`);
      return api.sendMessage(`🛠️ Edit complete: ${res.data.message}`, event.threadID, event.messageID);
    }

    const res = await axios.get(`${link}?text=${encodeURIComponent(input)}&senderID=${uid}`);
    const reply = res.data.reply || "আমি এটা শিখিনি";

    return api.sendMessage(reply, event.threadID, (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
      });
    }, event.messageID);

  } catch (err) {
    return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function({ api, event }) {
  try {
    if (event.type !== "message_reply") return;
    const replyText = event.body.toLowerCase();
    const link = await baseApiUrl() + "/baby";
    const res = await axios.get(`${link}?text=${encodeURIComponent(replyText)}&senderID=${event.senderID}`);
    const reply = res.data.reply || "আমি এটা শিখিনি";
    return api.sendMessage(reply, event.threadID, (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
      });
    }, event.messageID);
  } catch (err) {
    return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
  }
};
