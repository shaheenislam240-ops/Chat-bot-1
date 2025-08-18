module.exports.config = {
  name: "reactunsend",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Abdullah",
  description: "Send a message and unsend it if 🥺 reaction is given",
  commandCategory: "system",
  usages: "",
  cooldowns: 0
};

// Step 1: Command run korle bot ekta message pathabe
module.exports.run = async ({ api, event }) => {
  api.sendMessage("🥰 Hello! React with 🥺 to delete me!", event.threadID, (err, info) => {
    if (err) return console.log(err);

    // save messageID to track later
    global.lastBotMessage = info.messageID;
  });
};

// Step 2: Jodi oi message e react deya hoy
module.exports.handleReaction = async ({ api, event }) => {
  const { reaction, messageID, userID } = event;

  // only react if user reacted with 🥺 and it's the bot's last message
  if (reaction === "🥺" && messageID === global.lastBotMessage) {
    api.unsendMessage(messageID);
  }
};
