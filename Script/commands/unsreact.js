module.exports.config = {
  name: "unsreact",
  eventType: ["message_reaction"],
  version: "1.0.0",
  credits: "rX",
  description: "User 🐣 reaction → unsend bot message instantly",
};

// Global array to save bot messages
if (!global.client.handleReaction) global.client.handleReaction = [];

// When bot sends a message, save it here
module.exports.saveBotMessage = function(messageID) {
  global.client.handleReaction.push({
    messageID: messageID,
    senderID: global.client.getCurrentUserID ? global.client.getCurrentUserID() : "" // bot ID
  });
};

// Reaction handler
module.exports.handleReaction = async function({ api, event, handleReaction }) {
  try {
    // শুধু 🐣 reaction handle
    if (event.reaction !== "🐣") return;

    // Check if this message was sent by bot
    const botMsg = global.client.handleReaction.find(msg => msg.messageID == event.messageID);
    if (!botMsg) return;

    // Unsending message
    api.unsendMessage(event.messageID, (e) => {
      if (e) console.log("Unsend failed:", e);
    });

    // Remove from saved array
    global.client.handleReaction = global.client.handleReaction.filter(msg => msg.messageID !== event.messageID);

  } catch (err) {
    console.log("unsreact error:", err);
  }
};
