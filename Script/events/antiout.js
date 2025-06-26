const fs = global.nodemodule["fs-extra"];

module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "1.0.1",
  hasPermssion: 1,
  credits: "Modified by rX Abdullah",
  description: "Auto add back when someone leaves & toggle on/off",
  usages: "[on/off]",
  commandCategory: "group",
  cooldowns: 5
};

// ========== EVENT SYSTEM ==========
module.exports.handleEvent = async ({ event, api, Threads, Users }) => {
  let data = (await Threads.getData(event.threadID)).data || {};

  // Antiout বন্ধ থাকলে কিছু করবে না
  if (data.antiout !== true) return;

  // যদি বট নিজে লিভ করে তাহলে কাজ করবে না
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
  const type = (event.author == event.logMessageData.leftParticipantFbId) ? "self-separation" : "kicked";

  if (type == "self-separation") {
    api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error) => {
      if (error) {
        api.sendMessage(`❌ সরি বস, ${name} এই আবালটারে এড করতে পারলাম না। হয় ব্লক করছে, না হয় মেসেঞ্জার নাই।\n\n✦ rX Chatbot | আব্দুল্লাহ`, event.threadID);
      } else {
        api.sendMessage(`😒 শোন, ${name} এই গ্রুপ হইলো গ্যাং!\n👉 এখান থেকে যেতে চাইলে এডমিনের পারমিশন লাগে!\n😎 তুই পারমিশন ছাড়া লিভ নিছোস – তোকে আবার টেনে আনলাম!\n\n✦ rX Chatbot | আব্দুল্লাহ`, event.threadID);
      }
    });
  }
};

// ========== COMMAND SYSTEM ==========
module.exports.run = async ({ api, event, args, Threads }) => {
  const threadData = await Threads.getData(event.threadID);
  let data = threadData.data || {};

  if (args[0] == "on") {
    data.antiout = true;
    await Threads.setData(event.threadID, { data });
    return api.sendMessage("✅ Antiout সিস্টেম চালু হয়েছে!\nকেউ নিজে বের হলে আবার এড হবে।", event.threadID);
  }

  if (args[0] == "off") {
    data.antiout = false;
    await Threads.setData(event.threadID, { data });
    return api.sendMessage("❌ Antiout সিস্টেম বন্ধ করা হয়েছে!\nএখন কেউ বের হলে আর এড হবে না।", event.threadID);
  }

  return api.sendMessage("📌 সঠিক ব্যবহার:\nantiout on ➤ চালু করতে\nantiout off ➤ বন্ধ করতে", event.threadID);
};
