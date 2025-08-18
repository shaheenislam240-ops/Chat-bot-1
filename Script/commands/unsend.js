module.exports.config = {
  name: "unsreact",
  eventType: ["message_reaction"],
  version: "1.0.0",
  credits: "rX",
  description: "User 🐣 reaction → unsend bot message + confirmation",
};

module.exports.run = async ({ api, event, handleReaction, getText }) => {
  try {
    // শুধু 🐣 reaction
    if (event.reaction != "🐣") return;

    // শুধুমাত্র original author reaction
    if (event.userID != handleReaction.author) return;

    const botID = api.getCurrentUserID();

    // Check: message sender bot কি
    if (handleReaction.senderID !== botID) return;

    // Message unsend
    api.unsendMessage(handleReaction.messageID, (err) => {
      if (err) console.log("Unsend failed:", err);
    });

    // Confirmation message
    api.sendMessage("✅ Message unsent successfully!", event.threadID, event.messageID);
  } catch (e) {
    console.log("unsreact_confirm error:", e);
  }
};
