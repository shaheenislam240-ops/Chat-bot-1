const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "only", // command name (যা-খুশি দিতে পারো)
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rxabdullah",
  description: "Send photo from Imgur when only prefix is sent",
  commandCategory: "fun", // command category
  usages: "",
  cooldowns: 5
};

module.exports.handleEvent = async function({ api, event }) {
  const prefix = global.config.PREFIX; // Bot এর prefix
  const imgurLink = "https://i.imgur.com/SRQbljq.jpeg"; // Imgur link
  const customText = "𝐇𝐞𝐲 𝐛𝐛𝐲 𝐢𝐚𝐦 𝐦𝐚𝐫𝐢𝐚 𝐛𝐛𝐲"; // Custom text

  // যদি কেউ শুধু prefix পাঠায়
  if (event.body && event.body.trim() === prefix) {
    try {
      const cacheDir = path.resolve(__dirname, "cache");
      const imgPath = path.join(cacheDir, "only.jpg");

      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      // Image download
      const response = await axios.get(imgurLink, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      // Send with attachment
      return api.sendMessage(
        { body: customText, attachment: fs.createReadStream(imgPath) },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );
    } catch (err) {
      return api.sendMessage("❌ Imgur থেকে photo আনতে সমস্যা হয়েছে!", event.threadID, event.messageID);
    }
  }
};

module.exports.run = async function() {
  // এখানে run দরকার নেই
};
