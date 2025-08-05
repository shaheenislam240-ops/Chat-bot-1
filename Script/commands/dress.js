const Replicate = require("replicate");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports.config = {
  name: "dress",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Change dress using AI (photo reply)",
  commandCategory: "ai",
  usages: "[reply image]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  });

  const { messageReply, threadID, messageID } = event;

  // Check if replied to a photo
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to a photo!", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ Only photo replies are supported.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const prompt = "Change the dress to a red saree"; // Change this if you want

  // Send temp message
  const sentMsg = await api.sendMessage("🧠 Changing dress using AI. Please wait...", threadID);

  try {
    const output = await replicate.run(
      "timbrooks/instruct-pix2pix:9e4506b5b6b7ec8cc91a1c7f52fd6476b27d18cb40ae1426713c58644a15c1c3",
      {
        input: {
          image: imageUrl,
          prompt: prompt
        }
      }
    );

    const resultUrl = output[0];
    const filePath = path.join(__dirname, "dress_result.png");

    const imgRes = await axios.get(resultUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(imgRes.data, "binary"));

    // Send edited photo
    api.sendMessage({
      body: "✅ Done! Here's the new look.",
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath), messageID);

  } catch (err) {
    console.error("❌ AI Error:", err.message || err);
    api.sendMessage("❌ Something went wrong. Please try again.", threadID, messageID);
  }

  // Unsend 'processing...' message
  if (sentMsg?.messageID) {
    api.unsendMessage(sentMsg.messageID);
  }
};
