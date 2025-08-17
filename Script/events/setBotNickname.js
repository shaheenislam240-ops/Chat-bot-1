module.exports.config = {
  name: "botname",
  eventType: ["log:subscribe"],
  version: "1.0.3",
  credits: "rX Abdullah",
  description: "Auto set bot nickname from global.config when added to a group"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, logMessageData } = event;
  const addedParticipants = logMessageData.addedParticipants || [];
  const botID = api.getCurrentUserID();

  // global.config থেকে bot nickname নেবে, কোনো default নেই
  if (!global.config.BOTNAME) return; // যদি config এ কিছু না থাকে, কিছু করবে না
  const botNickname = global.config.BOTNAME;

  for (const participant of addedParticipants) {
    if (participant.userFbId == botID) {
      try {
        await api.changeNickname(botNickname, threadID, botID);
      } catch (e) {
        console.log("Bot nickname set korte somossa holo:", e.message);
      }
    }
  }
};
