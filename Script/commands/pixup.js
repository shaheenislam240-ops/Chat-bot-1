const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

module.exports.config = {
  name: "pixup",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "rX", //project. of. rX. Abdullah
  description: "Upload replied file to Pixeldrain and return link",
  commandCategory: "tool",
  usages: "[filename (optional) | reply a file]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const { messageReply, threadID, messageID } = event;
  const apiKey = "11379c5d-5de2-42b5-b1e2-8a378e3c2812";

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("⚠️ Please reply to a video, photo, or file to upload to Pixeldrain.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  const url = attachment.url;
  const ext = path.extname(url) || ".mp4";
  const customName = args.join(" ") || `file_${Date.now()}`;
  const tempFile = path.join(__dirname, `/tmp_${Date.now()}${ext}`);

  try {
    // Step 1: Download file
    const file = (await axios.get(url, { responseType: "stream" })).data;
    const writer = fs.createWriteStream(tempFile);
    file.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Step 2: Upload to Pixeldrain
    const form = new FormData();
    form.append("file", fs.createReadStream(tempFile));
    form.append("name", customName + ext); // optional custom name

    const uploadRes = await axios.post("https://pixeldrain.com/api/file/", form, {
      headers: {
        ...form.getHeaders(),
        "Authorization": "Basic " + Buffer.from(`:${apiKey}`).toString("base64")
      }
    });

    fs.unlinkSync(tempFile); // Clean temp file

    if (!uploadRes.data || !uploadRes.data.id) {
      return api.sendMessage("❌ Upload failed. Try again later.", threadID, messageID);
    }

    const fileId = uploadRes.data.id;
    const infoRes = await axios.get(`https://pixeldrain.com/api/file/${fileId}/info`);
    const info = infoRes.data;

    const link = `https://pixeldrain.com/u/${fileId}`;
    const sizeMB = (info.size / (1024 * 1024)).toFixed(2);

    return api.sendMessage(
      `✅ **File Uploaded Successfully!**\n` +
      `📄 Name: ${info.name}\n` +
      `📦 Size: ${sizeMB} MB\n` +
      `🆔 ID: ${info.id}\n` +
      `🔗 Link: ${link}`,
      threadID,
      messageID
    );

  } catch (err) {
    fs.existsSync(tempFile) && fs.unlinkSync(tempFile);
    return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
  }
};
