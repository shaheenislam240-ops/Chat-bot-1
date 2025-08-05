module.exports.config = {
  name: "leave",
  version: "1.0.0",
  hasPermission: 2,
  credits: "rx Abdullah",
  description: "Make bot leave a group by UID",
  usages: "!leave [groupuid]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const groupUID = args[0];

  if (!groupUID) {
    return api.sendMessage("⚠️ Group UID dao. Example: !leave 1234567890123456", event.threadID);
  }

  const botID = api.getCurrentUserID();

  try {
    await api.removeUserFromGroup(botID, groupUID);
    api.sendMessage(`✅ Successfully left group ${groupUID}.`, event.threadID);
  } catch (err) {
    console.log("Leave Error:", err);
    api.sendMessage("❌ Leave korte parlam na. Bot ki oi group-e ase?", event.threadID);
  }
};
