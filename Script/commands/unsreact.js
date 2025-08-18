module.exports.config = {
  name: "unsreact",
  eventType: ["message_reaction"],
  version: "1.1.0",
  credits: "rX",
  description: "User 🐣 reaction → guaranteed unsend bot message",
};

if (!global.client.savedBotMessages) global.client.savedBotMessages = [];

// যখন bot মেসেজ পাঠায়, এই function দিয়ে save করতে হবে
module.exports.saveBotMessage = function(messageID) {
  global.client.savedBotMessages.push(messageID);
};

module.exports.handleReaction = async function({ api, event }) {
  try {
    // শুধু 🐣 reaction handle
    if (event.reaction !== "🐣") return;

    // check: messageID saved কি না
    if (!global.client.savedBotMessages.includes(event.messageID)) return;

    // unsend message
    api.unsendMessage(event.messageID, (e) => {
      if (e) console.log("Unsend failed:", e);
    });

    // remove from saved array
    global.client.savedBotMessages = global.client.savedBotMessages.filter(id => id !== event.messageID);

  } catch (err) {
    console.log("unsreact error:", err);
  }
};
