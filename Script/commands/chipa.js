const fs = require("fs");

module.exports.config = {
  name: "chipa",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Chipa detect kore video send",
  commandCategory: "fun",
  usages: "",
  cooldowns: 0,
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID } = event;
  if (!body) return;

  // keyword check (english + bangla)
  const keyword = body.toLowerCase();
  if (keyword.includes("chipa") || keyword.includes("চিপা")) {
    api.sendMessage(
      {
        body: "sobai chipa theke ber how",
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/HJ6aHfC.mp4"),
      },
      threadID
    );
  }
};

module.exports.run = async function () {};
