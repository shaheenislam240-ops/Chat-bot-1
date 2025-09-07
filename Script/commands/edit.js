module.exports.config = {
  name: "edit",
  version: "1.0",
  hasPermssion: 1,
  credits: "rX",
  description: "Edit bot's messages!",
  commandCategory: "message",
  usages: "reply to a bot message then type <prefix>edit <your_message>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { messageReply, threadID } = event;
  const newMessage = args.join(" ");

  if (!messageReply || !args || args.length === 0) {
    return api.sendMessage("❌ | Invalid input. Please reply to a bot message to edit.", threadID);
  }

  try {
    await api.changeMessage(messageReply.messageID, newMessage);
    // Optional reaction to indicate success (if your bot supports reactions)
    api.sendMessage("✅ | Message successfully edited!", threadID);
  } catch (error) {
    console.error("Error editing message:", error);
    api.sendMessage("❌ | An error occurred while editing the message. Please try again later.", threadID);
  }
};
