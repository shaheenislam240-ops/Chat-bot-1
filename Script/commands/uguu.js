const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "uguu",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "RX Abdullah + Maria",
  description: "Reply to an audio message with !uguu to upload to Uguu.se",
  commandCategory: "utility",
  usages: "[reply to audio] !uguu",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const replyMsg = event.messageReply;

  // Check if user replied to an audio message
  if (!replyMsg || !replyMsg.attachments || replyMsg.attachments.length === 0) {
    return api.sendMessage("⚠️ Please reply to an audio message with !uguu", threadID, messageID);
  }

  const audio = replyMsg.attachments.find(att => att.type === "audio");

  if (!audio) {
    return api.sendMessage("❌ Only audio files are supported.", threadID, messageID);
  }

  const audioUrl = audio.url;
  const filePath = path.join(__dirname, "temp_audio.mp3");

  try {
    // Download audio
    const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));

    // Upload to Uguu
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const upload = await axios.post("https://uguu.se/upload.php", form, {
      headers: form.getHeaders()
    });

    const fileUrl = upload.data.files?.[0]?.url;
    fs.unlinkSync(filePath); // Delete temp file

    if (!fileUrl) throw new Error("No URL from Uguu");

    api.sendMessage(`✅ Uploaded to Uguu (30 days):\n🔗 ${fileUrl}`, threadID, messageID);

  } catch (e) {
    console.error("Upload error:", e.message);
    api.sendMessage("❌ Upload failed. Try again later.", threadID, messageID);
  }
};
