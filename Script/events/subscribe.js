// /Script/events/subscribe.js
module.exports.config = {
  name: "subscribe",
  eventType: ["log:subscribe"], // only subscribe events
  version: "1.0.0",
  credits: "rX Abdullah",
  description: "Handle bot being added to new group"
};

module.exports.run = async function({ api, event }) {
  const { threadID, logMessageData } = event;

  for (const participant of logMessageData.addedParticipants) {
    const id = participant.userFbId;

    if (id == api.getCurrentUserID()) {
      // Only respond if BOT is added
      api.sendMessage(
        "Hello 👋 Thanks for adding me!\nUse !help to see my commands.",
        threadID
      );
    }
    // Normal members joining are ignored
  }
};
