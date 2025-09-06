module.exports.config = {
  name: "only",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rxabdullah",
  description: "Reply with custom text when only prefix is sent",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

module.exports.handleEvent = function({ api, event }) {
  const prefix = global.config.PREFIX; // Bot এর prefix config থেকে নিবে
  const customText = "𝐇𝐞𝐲 𝐛𝐛𝐲 𝐢𝐚𝐦 𝐦𝐚𝐫𝐢𝐚 𝐛𝐛𝐲"; // এখানে তোমার কাস্টম মেসেজ লেখো

  // যদি কেউ শুধু prefix পাঠায়
  if (event.body && event.body.trim() === prefix) {
    return api.sendMessage(customText, event.threadID, event.messageID);
  }
};

module.exports.run = async function () {
  // এই command এর জন্য run দরকার নাই
};
