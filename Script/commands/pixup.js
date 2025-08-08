const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

module.exports.config = {
  name: "pixup",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX + ChatGPT",
  description: "Upload replied file to Pixeldrain and return link",
  commandCategory: "tool",
  usages: "[reply a file]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, messageID } = event;
  const apiKey = "11379c5d-5de2-42b5-b1e2-8a378e3c2812";

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("⚠️ Please reply to a video, photo, or file to upload to Pixeldrain.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  const url = attachment.url;
  const ext = path.extname(url) || ".mp4";
  const tempFile = __dirname + `/tmp_${Date.now()}${ext}`;

  try {
    // Download the file
    const file = (await axios.get(url, { responseType: "stream" })).data;
    const writer = fs.createWriteStream(tempFile);
    file.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Upload to Pixeldrain
    const form = new FormData();
    form.append("file", fs.createReadStream(tempFile));

    const uploadRes = await axios.post("https://pixeldrain.com/api/file/", form, {
      headers: {
        ...form.getHeaders(),
        "Authorization": "Basic " + Buffer.from(`:${apiKey}`).toString("base64")
      }
    });

    fs.unlinkSync(tempFile); // Clean temp file

    if (uploadRes.data && uploadRes.data.success) {
      const fileId = uploadRes.data.id;
      const link = `https://pixeldrain.com/u/${fileId}`;
      return api.sendMessage(`✅ File uploaded successfully!\n📥 Link: ${link}`, threadID, messageID);
    } else {
      return api.sendMessage("❌ Upload failed. Try again later.", threadID, messageID);
    }

  } catch (err) {
    fs.existsSync(tempFile) && fs.unlinkSync(tempFile);
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
};
