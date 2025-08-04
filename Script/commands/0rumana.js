const fs = require("fs");
module.exports.config = {
  name: "rumana",
    version: "1.0.1",
  hasPermssion: 0,
  credits: "rX", 
  description: "hihihihi",
  commandCategory: "no prefix",
  usages: "rumana",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
  var { threadID, messageID } = event;
  if (event.body.indexOf("rumana")==0 || event.body.indexOf("RUMANA")==0 || event.body.indexOf("Rumana")==0 || event.body.indexOf("রুমানা")==0) {
    var msg = {
        body: "keyword RUMANA",
        attachment: fs.createReadStream(__dirname + `/noprefix/rumana.mp4`)
      }
      api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("😡", event.messageID, (err) => {}, true)
    }
  }
  module.exports.run = function({ api, event, client, __GLOBAL }) {

  }
