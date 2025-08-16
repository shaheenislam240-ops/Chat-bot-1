const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "setwelcome",
  version: "2.0.0",
  hasPermssion: 1,
  credits: "rX Abdullah",
  description: "Set fully custom welcome message with placeholders + optional media (photo/gif/video)",
  commandCategory: "group",
  usages: "!setwelcome <message> (reply with photo/gif optional)",
  cooldowns: 5
};

const dataFile = path.join(__dirname, "welcomeData.json");

// Ensure storage file exists
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}");

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  let data = JSON.parse(fs.readFileSync(dataFile));

  if (args.length === 0 && !event.messageReply) {
    return api.sendMessage(
      "⚠️ Usage:\n!setwelcome Hello {username}, welcome to {groupname} 🎉\n\n👉 Optional: reply with photo/gif to set media.",
      threadID,
      event.messageID
    );
  }

  // Save custom text
  const msg = args.join(" ");
  if (!data[threadID]) data[threadID] = {};
  if (msg) data[threadID].message = msg;

  // Save media if reply
  if (event.messageReply && event.messageReply.attachments.length > 0) {
    const attachment = event.messageReply.attachments[0];
    if (["photo", "animated_image", "video"].includes(attachment.type)) {
      data[threadID].mediaUrl = attachment.url;
    }
  }

  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

  return api.sendMessage(
    "✅ Custom Welcome set for this group!\n\nMessage: " +
      (msg || data[threadID].message) +
      (data[threadID].mediaUrl ? "\n📷 Media attached" : ""),
    threadID,
    event.messageID
  );
};

// Auto trigger on new member
module.exports.handleEvent = async function({ api, event }) {
  if (event.logMessageType === "log:subscribe") {
    const threadID = event.threadID;
    const data = JSON.parse(fs.readFileSync(dataFile));

    if (!data[threadID]) return;

    const info = await api.getThreadInfo(threadID);
    const groupName = info.threadName;
    const memberCount = info.participantIDs.length;

    for (let user of event.logMessageData.addedParticipants) {
      const userName = user.fullName;
      const addedById = event.author;
      let addedByName = "";
      try {
        const userInfo = await api.getUserInfo(addedById);
        addedByName = userInfo[addedById].name;
      } catch {
        addedByName = "Unknown";
      }

      // Replace placeholders
      let message = data[threadID].message || "{username} joined {groupname}";
      message = message
        .replace(/\{username\}/g, userName)
        .replace(/\{groupname\}/g, groupName)
        .replace(/\{membercount\}/g, memberCount)
        .replace(/\{by\}/g, addedByName);

      if (data[threadID].mediaUrl) {
        api.sendMessage(
          {
            body: message,
            attachment: await global.utils.getStreamFromURL(data[threadID].mediaUrl)
          },
          threadID
        );
      } else {
        api.sendMessage(message, threadID);
      }
    }
  }
};
