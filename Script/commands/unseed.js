module.exports.config = {
  name: "unseed",
  version: "1.0.2",
  hasPermission: 0,
  credits: "Omit Modify by rX Abdullah",
  description: "Unsend bot message if user replies or reacts with trigger",
  commandCategory: "system",
  usages: "",
  cooldowns: 0
};

module.exports.languages = {
  "vi": {
    "returnCant": "Không thể gỡ tin nhắn của người khác.",
    "missingReply": "Hãy reply tin nhắn cần gỡ."
  },
  "en": {
    "returnCant": "Cannot unsend messages from others.",
    "missingReply": "Please reply to the message you want to unsend."
  }
};

module.exports.run = () => { }; // Not used

module.exports.handleEvent = async function ({ api, event, getText }) {
  const botID = api.getCurrentUserID();

  // ✅ 1. Handle reaction to bot message
  if (event.type === "message_reaction") {
    const { reaction, messageID, userID } = event;

    if (reaction === "😡" && userID !== botID) {
      try {
        await api.unsendMessage(messageID);
      } catch (e) {
        console.log("❌ Failed to unsend (reaction):", e.message);
      }
    }
  }

  // ✅ 2. Handle reply to bot message with keywords
  else if (event.type === "message_reply") {
    const { messageReply, body, threadID, messageID } = event;

    // Only act if replied-to message is from the bot
    if (messageReply.senderID == botID) {
      const triggers = ["/unsent", "/uns", "😡", "sorry", "Sorry"];

      if (triggers.includes(body.trim())) {
        try {
          await api.unsendMessage(messageReply.messageID);
        } catch (e) {
          console.log("❌ Failed to unsend (reply):", e.message);
        }
      }
    } else {
      return api.sendMessage(getText("returnCant"), threadID, messageID);
    }
  }
};
