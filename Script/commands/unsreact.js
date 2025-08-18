module.exports.config = {
  name: "unsreact",
  eventType: ["message_reaction"],
  version: "1.0.1",
  credits: "rX Abdullah",
  description: "React 🐣 on bot message in group to unsend it",
};

module.exports.run = async function({ api, event }) {
  try {
    const botID = api.getCurrentUserID();

    // শুধুমাত্র 🐣 reaction handle
    if (event.reaction !== "🐣") return;

    // শুধু গ্রুপ চ্যাটে কাজ করবে
    // Personal threadID ছোট, group/room ID বড় (16+ digits)
    if (String(event.threadID).length < 16) return;

    // messageID থেকে মেসেজ info নাও
    api.getMessageInfo(event.messageID, (err, info) => {
      if (err) return console.log("GetMessageInfo error:", err);

      // যদি মেসেজ বটের হয়
      if (info.senderID === botID) {
        api.unsendMessage(event.messageID, (e) => {
          if (e) console.log("Unsend failed:", e);
        });
      }
    });
  } catch (err) {
    console.log("unsreact_group error:", err);
  }
};
