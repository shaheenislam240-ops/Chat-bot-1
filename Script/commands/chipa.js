const fs = require("fs");
module.exports.config = {
  name: "chipa",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "rX", 
  description: "Detects 'chipa' in any message",
  commandCategory: "no prefix",
  usages: "Just type anything with chipa",
  cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const keywordList = ["Chipa", "chipa", "chipay", "চিপা"];
  const isMatch = keywordList.some(word => body.toLowerCase().includes(word.toLowerCase()));

  if (isMatch) {
    const msg = {
      body: "Chipa theke ber how 🫣,
      attachment: fs.createReadStream(__dirname + `/noprefix/chipa.mp4`)
    };
    api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("😁", event.messageID, (err) => {}, true);
  }
};

module.exports.run = function({ api, event, client, __GLOBAL }) {
  // no command usage
};
