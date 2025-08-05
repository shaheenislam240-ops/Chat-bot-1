module.exports.config = {
  name: "addme",
  version: "1.0.1",
  hasPermission: 0,
  credits: "rx Abdullah",
  description: "Public group e nijeke add korar system",
  usages: "!addme [groupuid]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  if (!args[0]) {
    return api.sendMessage("⚠️ Group UID দাও। উদাহরণ: !addme 1234567890123456", event?.threadID || event?.senderID);
  }

  const groupUID = args[0];
  const senderID = event.senderID;
  const replyThread = event?.threadID || senderID; // fallback reply

  try {
    await api.addUserToGroup(senderID, groupUID);
    return api.sendMessage(`✅ তোমাকে গ্রুপে যোগ করে দিলাম!`, replyThread);
  } catch (err) {
    console.error("AddMe Error:", err);
    let errorMsg = "❌ যোগ করা যায়নি।";

    if (err?.error?.error_subcode === 1346003) {
      errorMsg += " আগে বটকে ঐ গ্রুপে যোগ করতে হবে।";
    } else if (err?.error?.message?.includes("not friends")) {
      errorMsg += " তুমি ও বট বন্ধু না। আগে বটকে friend request পাঠাও।";
    } else {
      errorMsg += " গ্রুপটা public তো?";
    }

    return api.sendMessage(errorMsg, replyThread);
  }
};
