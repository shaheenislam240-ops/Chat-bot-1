module.exports.config = {
  name: "tag",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "RxHelper",
  description: "Tag someone N times (separate messages with delay)",
  commandCategory: "utility",
  usages: "!tag <Nx> @mention | or reply a message then use: !tag <Nx>",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const MAX_TIMES = 100;
    const reply = event.messageReply;

    if (!args[0]) {
      return api.sendMessage(
        "Usage:\n• !tag 20x @someone\n• (Reply a user) !tag 10x\n\nNote: max 100x",
        event.threadID, event.messageID
      );
    }

    // Parse like "20x"
    const timesMatch = String(args[0]).toLowerCase().match(/^(\d{1,3})x$/);
    if (!timesMatch) {
      return api.sendMessage(
        "First argument must be like 10x / 20x / 100x.",
        event.threadID, event.messageID
      );
    }

    let times = parseInt(timesMatch[1], 10);
    if (isNaN(times) || times < 1) {
      return api.sendMessage("Times must be a positive number.", event.threadID, event.messageID);
    }
    if (times > MAX_TIMES) times = MAX_TIMES;

    // Find target UID + name
    let targetID = null;
    let targetName = null;

    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      targetName = event.mentions[targetID].replace("@", "");
    } else if (reply && reply.senderID) {
      targetID = reply.senderID;
      targetName = reply.body ? reply.body.split(" ")[0] : "User";
    }

    if (!targetID) {
      return api.sendMessage("You must @mention someone or reply a user's message.", event.threadID, event.messageID);
    }

    // Send each mention one by one with 1 second delay
    for (let i = 0; i < times; i++) {
      await new Promise(res => {
        api.sendMessage({
          body: `(${i + 1}) @${targetName}`,
          mentions: [{ tag: "@" + targetName, id: targetID }]
        }, event.threadID, res);
      });

      // 1 second delay
      await new Promise(r => setTimeout(r, 1000));
    }

  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ Something went wrong while tagging.", event.threadID, event.messageID);
  }
};
