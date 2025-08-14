module.exports.config = {
  name: "babymention",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "Priyansh",
  description: "Mention sender with Teach reply message",
  commandCategory: "Chat",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Teach, Users }) {
  try {
    const input = args.join(" ").split("-");
    if (input.length < 2) return api.sendMessage("❌ Format: !baby mentionmsg <trigger> - <reply message>", event.threadID);

    const trigger = input[0].trim().toLowerCase();
    let replyMessage = input[1].trim();

    // check trigger exists
    const doc = await Teach.findOne({ question: trigger });
    if (!doc) return api.sendMessage("❌ Trigger not found", event.threadID);

    // get sender name
    const senderName = await Users.getName(event.senderID);

    // replace default @someone with sender name
    replyMessage = replyMessage.replace("@someone", `@${senderName}`);

    // send message
    api.sendMessage(replyMessage, event.threadID);

  } catch (e) {
    console.error(e);
    api.sendMessage("⚠️ Error occurred while processing", event.threadID);
  }
};
