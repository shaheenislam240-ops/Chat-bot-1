const Replicate = require("replicate");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "dress",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Change dress using AI",
  commandCategory: "ai",
  usages: "[reply with image]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // Check if user replied to an image
  if (!event.messageReply || event.messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to a photo!", event.threadID, event.messageID);
  }

  const attachment = event.messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ Only photo replies are supported.", event.threadID, event.messageID);
  }

  const imageUrl = attachment.url;
  const prompt = "Change the dress to a red saree"; // you can customize or parse args

  const sent = await api.sendMessage("🧠 AI is editing the dress...", event.threadID);

  try {
    const output = await replicate.run(
      "timbrooks/instruct-pix2pix:9e4506b5b6b7ec8cc91a1c7f52fd6476b27d18cb40ae1426713c58644a15c1c3",
      {
        input: {
          image: imageUrl,
          prompt: prompt,
        },
      }
    );

    const resultImage = output[0];
    const filePath = path.join(__dirname, "dress_output.png");
    const response = await axios.get(resultImage, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

    api.sendMessage(
      {
        body: "✅ Done! Here's the edited photo.",
        attachment: fs.createReadStream(filePath),
      },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Something went wrong while editing the dress.", event.threadID, event.messageID);
  }

  // Unsend the "editing..." message
  api.unsendMessage(sent.messageID);
};
