const fs = require("fs");
module.exports.config = {
  name: "abdullah",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "rX", 
  description: "Detects 'abdullah' in any message",
  commandCategory: "no prefix",
  usages: "Just type anything with abdullah",
  cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const keywordList = ["abdullah", "Abdullah", "ABDULLA", "abdulla"];
  const isMatch = keywordList.some(word => body.toLowerCase().includes(word.toLowerCase()));

  if (isMatch) {
    const msg = {
      body: "★彡🌙⛧∘₊˚⋆rX Abdullah ∘₊˚⋆⛧🌙彡★

⚡ ᴘᴏᴡᴇʀ ʟᴇᴠᴇʟ: 9999%

｡･ﾟﾟ･　★　･ﾟﾟ･｡
🌟 Sᴜᴘᴇʀ Sᴀɪʏᴀɴ Mᴏᴅᴇ Aᴄᴛɪᴠᴀᴛᴇᴅ 🌟
｡･ﾟﾟ･　★　･ﾟﾟ･｡

༺🌙  keyword rX Abdullah🌙༻",
      attachment: fs.createReadStream(__dirname + `/noprefix/abdullah.mp4`)
    };
    api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("⚡️", event.messageID, (err) => {}, true);
  }
};

module.exports.run = function({ api, event, client, __GLOBAL }) {
  // no command usage
};
