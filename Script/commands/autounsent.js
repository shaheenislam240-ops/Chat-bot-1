module.exports.config = {
  name: "autounsent",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "rX Abdullah",
  description: "Unsend bot messages on reaction (prefix logic used)",
  commandCategory: "system",
  usages: "",
  cooldowns: 0
};

module.exports.handleReaction = async function({ api, event, handleReaction }) {
  try {
    // react দিলেই unsent করবে
    api.unsendMessage(handleReaction.messageID);
  } catch (e) {
    console.log(e);
  }
};

module.exports.run = async ({ api, event }) => {
  // test করার জন্য একটা message পাঠাবে
  api.sendMessage("এই মেসেজে react দিলেই unsent হবে 🐣", event.threadID, (err, info) => {
    global.client.handleReaction.push({
      name: "autounsent",   // এই ফাইলের নাম
      messageID: info.messageID
    });
  });
};
