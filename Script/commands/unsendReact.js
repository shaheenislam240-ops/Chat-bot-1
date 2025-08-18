module.exports.config = {
  name: "reactUnsend",
  eventType: ["message_reaction"],
  version: "1.0.0",
  credits: "Priyansh",
  description: "React 🥺 on bot's message → bot unsends it (Always ON)"
};

module.exports.handleEvent = async ({ api, event }) => {
  try {
    if (event.type !== "message_reaction") return;

    // only 🥺 works
    if (event.reaction !== "🥺") return;

    // get info about the reacted message
    const info = await api.getMessageInfo(event.threadID, event.messageID);
    if (!info) return;

    // check if that message was sent by the bot
    if (info.message && info.message.senderID === api.getCurrentUserID()) {
      api.unsendMessage(event.messageID);
    }
  } catch (e) {
    console.error("reactUnsend error:", e);
  }
};
