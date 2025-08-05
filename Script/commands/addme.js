module.exports.config = {
  name: "addme",
  version: "1.0.0",
  hasPermission: 0,
  credits: "rx Abdullah",
  description: "Add yourself to a public Messenger group by UID",
  usages: "!addme [groupuid]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const groupUID = args[0];
  const senderID = event.senderID;

  if (!groupUID) {
    return api.sendMessage("⚠️ Group UID dao. Example: !addme 1234567890123456", event.threadID);
  }

  try {
    await api.addUserToGroup(senderID, groupUID);
    api.sendMessage(`✅ Toke oi group-e add kore dilam!`, event.threadID);
  } catch (err) {
    console.log("AddMe Error:", err);
    let errorMsg = "❌ Add korte parlam na.";
    if (err?.error?.error_subcode === 1346003) {
      errorMsg += " Bot ke age oi group-e add korte hobe.";
    } else if (err?.error?.message?.includes("not friends")) {
      errorMsg += " Bot ar tumi friend na. Age bot ke friend request pathao.";
    } else {
      errorMsg += " Group public toh?";
    }
    api.sendMessage(errorMsg, event.threadID);
  }
};
