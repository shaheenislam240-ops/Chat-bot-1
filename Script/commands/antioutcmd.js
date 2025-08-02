module.exports.config = {
  name: "antiout",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "rX Abdullah",
  description: "Turn antiout on or off",
  commandCategory: "group",
  usages: "[on/off]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Threads }) => {
  const { threadID, messageID } = event;

  if (!args[0]) return api.sendMessage("দয়া করে `on` অথবা `off` লিখুন।", threadID, messageID);

  let data = (await Threads.getData(threadID)).data || {};
  if (args[0].toLowerCase() === "on") {
    data.antiout = true;
    await Threads.setData(threadID, { data });
    return api.sendMessage("✅ antiout সিস্টেম চালু করা হয়েছে।", threadID, messageID);
  } else if (args[0].toLowerCase() === "off") {
    data.antiout = false;
    await Threads.setData(threadID, { data });
    return api.sendMessage("❌ antiout সিস্টেম বন্ধ করা হয়েছে।", threadID, messageID);
  } else {
    return api.sendMessage("শুধু `on` অথবা `off` লিখুন।", threadID, messageID);
  }
};
