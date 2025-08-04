const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "rumana",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "rX",
  description: "Detects 'rumana' in any message",
  commandCategory: "no prefix",
  usages: "Just type anything with rumana",
  cooldowns: 5,
};

module.exports.handleEvent = function({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const keywordList = ["rumana", "RUMANA", "Rumana", "রুমানা"];
  const isMatch = keywordList.some(word => body.toLowerCase().includes(word.toLowerCase()));

  if (isMatch) {
    // List of video filenames
    const videoFiles = ["rumana1.mp4", "rumana2.mp4"];

    // Randomly choose one
    const selectedVideo = videoFiles[Math.floor(Math.random() * videoFiles.length)];

    const msg = {
      body: "keyword RUMANA",
      attachment: fs.createReadStream(path.join(__dirname, "noprefix", selectedVideo))
    };

    api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("😡", event.messageID, () => {}, true);
  }
};

module.exports.run = function({ api, event }) {
  // No prefix command used
};
