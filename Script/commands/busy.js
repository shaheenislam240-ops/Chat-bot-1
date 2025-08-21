// busy.js
const busyGroups = new Set();

module.exports.config = {
  name: "busy",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Stop all commands in this group until turned off",
  commandCategory: "system",
  usages: "on/off",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  // যদি group busy থাকে তবে !busy ছাড়া আর কিছুই কাজ করবে না
  if (busyGroups.has(event.threadID)) {
    if (!event.body?.toLowerCase().startsWith("!busy")) {
      return; // সবকিছু ignore করবে
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;

  if (!args[0]) {
    return api.sendMessage("❌ ব্যবহার করুন: !busy on অথবা !busy off", threadID, event.messageID);
  }

  if (args[0].toLowerCase() === "on") {
    busyGroups.add(threadID);
    return api.sendMessage("✅ এই গ্রুপ এখন Busy mode এ আছে। কোনো command/file কাজ করবে না।", threadID, event.messageID);
  }

  if (args[0].toLowerCase() === "off") {
    busyGroups.delete(threadID);
    return api.sendMessage("✅ এই গ্রুপ এখন Normal mode এ ফিরে এসেছে।", threadID, event.messageID);
  }

  return api.sendMessage("❌ Invalid option! ব্যবহার করুন: on / off", threadID, event.messageID);
};
