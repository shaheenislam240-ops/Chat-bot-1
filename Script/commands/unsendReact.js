module.exports.config = {
  name: "unsendReact",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Modified by Abdullah",
  description: "Unsend bot's message if user reacts to it",
  commandCategory: "system",
  usages: "",
  cooldowns: 0
};

module.exports.handleReaction = async ({ api, event }) => {
  const { messageID, userID, reaction } = event;

  // Only work if bot itself sent the message
  if (event.senderID == api.getCurrentUserID()) return;

  // Jodi kono reaction hoy (emoji filter kora jete pare if needed)
  if (reaction) {
    try {
      // Unsend the message that got reacted
      await api.unsendMessage(messageID);
    } catch (e) {
      console.log("Unsend failed:", e);
    }
  }
};
