const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "babyupload",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "RX Abdullah",
  description: "Upload audio/video reply to Catbox + save via API",
  commandCategory: "media",
  usages: "[reply media] !baby upload <keyword> - <title>",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  if (event.type !== "message_reply") {
    return api.sendMessage("🔁 Please reply to an audio or video file.", event.threadID, event.messageID);
  }

  const { messageReply } = event;
  const attachment = messageReply.attachments && messageReply.attachments[0];

  if (!attachment || !["audio", "video"].includes(attachment.type)) {
    return api.sendMessage("❌ Only audio or video file supported.", event.threadID, event.messageID);
  }

  const match = args.join(" ").match(/^(.+?)\s*-\s*(.+)$/);
  if (!match) {
    return api.sendMessage("❗ Use format: !baby upload <keyword> - <title>", event.threadID, event.messageID);
  }

  const keyword = match[1].trim().toLowerCase();
  const title = match[2].trim();

  const fileUrl = attachment.url;
  const ext = path.extname(fileUrl).split("?")[0] || ".mp4";
  const tempPath = path.join(__dirname, `cache/temp${ext}`);

  try {
    // Download file
    const res = await axios.get(fileUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(tempPath, Buffer.from(res.data, "binary"));

    // Upload to catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempPath));

    const catbox = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const uploadedURL = catbox.data;

    // Send to your API
    await axios.post("https://rx-cloud-api.onrender.com/upload", {
      keyword,
      title,
      url: uploadedURL,
    });

    api.sendMessage(`✅ Saved keyword: "${keyword}"\n🎵 Title: ${title}`, event.threadID, event.messageID);
  } catch (e) {
    api.sendMessage("❌ Failed to upload or save. Try again!", event.threadID, event.messageID);
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
};
