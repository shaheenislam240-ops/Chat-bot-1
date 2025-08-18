module.exports.config = {
  name: "autounsent",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "rX Abdullah",
  description: "Unsend any bot message when someone reacts",
  commandCategory: "system",
  usages: "",
  cooldowns: 0
};

// Reaction ধরবে
module.exports.handleReaction = async function({ api, event, handleReaction }) {
  try {
    // যেকোনো ইউজার react দিলেই unsent করবে
    api.unsendMessage(handleReaction.messageID);
  } catch (e) {
    console.log(e);
  }
};

// Dummy run function (কোনো command দরকার নাই)
module.exports.run = async function() {};
