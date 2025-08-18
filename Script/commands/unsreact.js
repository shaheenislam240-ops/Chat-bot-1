module.exports.config = {
  name: "unsreact",
  eventType: ["message_reaction"],
  version: "1.0.0",
  credits: "rX",
  description: "React 🐣 on bot message to unsend it",
};

module.exports.run = async function({ api, event }) {
  try {
    const botID = api.getCurrentUserID();

    // শুধু 🐣 reaction handle
    if (event.reaction !== "🐣") return;

    // যেই message এ react হলো সেটার senderID check
    api.getMessageInfo(event.messageID, (err, info) => {
      if (err) return console.log(err);

      // যদি senderID বট হয়, তাহলে unsend করো
      if (info.senderID !== botID) return;

      // Unsend
      api.unsendMessage(event.messageID, (e) => {
        if (e) console.log("Unsend failed:", e);
      });
    });
  } catch (err) {
    console.log("unsreact error:", err);
  }
};
