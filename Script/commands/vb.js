const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "vb",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Rx Abdullah",
  description: "Change bot profile picture via reply",
  commandCategory: "admin",
  usages: "!vb photo",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { messageReply, threadID } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an image to set it as bot profile picture.", threadID);
  }

  // get first image attachment
  const attachment = messageReply.attachments.find(a => a.type === "photo");
  if (!attachment) {
    return api.sendMessage("❌ The replied message does not contain an image.", threadID);
  }

  const imageUrl = attachment.url;
  const filePath = path.join(__dirname, "cache", `bot_profile.jpg`);

  // download image
  const axios = require("axios");
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, response.data);

    // set bot profile picture
    if (api.setUserProfilePicture) {
      await api.setUserProfilePicture(filePath);
      return api.sendMessage("✅ Bot profile picture updated successfully.", threadID);
    } else {
      return api.sendMessage("⚠️ Your bot framework does not support setUserProfilePicture.", threadID);
    }
  } catch (err) {
    console.error("Profile pic update error:", err);
    return api.sendMessage("❌ Failed to update profile picture. Check logs.", threadID);
  }
};
