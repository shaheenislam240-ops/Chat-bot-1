module.exports.config = {
  name: "reactunsend",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Abdullah",
  description: "Unsend any bot message if reacted with 🥺",
  commandCategory: "system",
  usages: "",
  cooldowns: 0
};

// Example command just to send a message
module.exports.run = async ({ api, event }) => {
  api.sendMessage("🥰 Hello! React with 🥺 to delete me!", event.threadID);
};

// Reaction handler
module.exports.handleReaction = async ({ api, event }) => {
  const { reaction, messageID, userID } = event;

  // only react if emoji is 🥺
  if (reaction === "🥺") {
    // check if reacted message was sent by the bot itself
    api.getMessageInfo(event.threadID, messageID, (err, info) => {
      if (err) return console.error(err);

      if (info && info.messageSender && info.messageSender === api.getCurrentUserID()) {
        api.unsendMessage(messageID);
      }
    });
  }
};
