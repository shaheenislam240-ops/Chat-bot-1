module.exports.config = {
  name: "reactUnsend",
  eventType: ["message_reaction"],
  version: "1.0.1",
  credits: "Abdullah",
  description: "React 🫤 on bot's message → bot unsends that message"
};

module.exports.handleEvent = async ({ api, event }) => {
  try {
    if (event.type !== "message_reaction") return;

    // only 🫤 reaction works now
    if (event.reaction !== "🫤") return;

    // get info about the reacted message
    const info = await api.getMessageInfo(event.threadID, event.messageID);
    if (!info) return;

    // get senderID of that original message
    const senderID = info.message?.senderID || info.senderID;

    // check if the bot sent that message
    if (senderID === api.getCurrentUserID()) {
      api.unsendMessage(event.messageID);
    }
  } catch (e) {
    console.error("ReactUnsend error:", e);
  }
};
