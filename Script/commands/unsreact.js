module.exports.config = {
  name: "unsreact",
  eventType: ["message_reaction"],
  version: "1.0.0",
  credits: "rX Abdullah",
  description: "React 🐣 on a bot message to unsend it",
  dependencies: {}
};

module.exports.run = async function({ api, event }) {
  try {
    const botID = api.getCurrentUserID();

    // চেক করব 🐣 react দেওয়া হয়েছে কিনা
    if (event.reaction === "🐣") {
      // বটের পাঠানো মেসেজ হলে unsend হবে
      if (String(event.senderID) !== String(botID) && String(event.messageID)) {
        api.unsendMessage(event.messageID, (err) => {
          if (err) console.log("❌ Unsend error:", err);
        });
      }
    }
  } catch (e) {
    console.log("unsreact error:", e);
  }
};
