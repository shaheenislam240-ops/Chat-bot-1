const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

module.exports.config = {
  name: "uploadgofile",
  version: "1.0",
  hasPermssion: 0,
  credits: "rX",
  description: "Upload replied file/video to GoFile.io",
  commandCategory: "tools",
  usages: "[reply to a file]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, messageID } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to a file or video to upload.", threadID, messageID);
  }

  const fileUrl = messageReply.attachments[0].url;
  const fileExt = path.extname(messageReply.attachments[0].name || ".mp4");
  const fileName = `file_${Date.now()}${fileExt}`;
  const filePath = __dirname + `/cache/${fileName}`;

  try {
    // Download file
    const response = await axios({
      method: "GET",
      url: fileUrl,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Get server
    const serverRes = await axios.get("https://api.gofile.io/getServer");
    const server = serverRes.data.data.server;

    // Upload to GoFile
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const uploadRes = await axios.post(`https://${server}.gofile.io/uploadFile`, form, {
      headers: form.getHeaders(),
    });

    const { downloadPage, fileName: uploadedName } = uploadRes.data.data;

    // Cleanup
    fs.unlinkSync(filePath);

    // Send success message
    return api.sendMessage(
      `✅ File Uploaded Successfully!\n📄 Name: ${uploadedName}\n🔗 Link: ${downloadPage}`,
      threadID,
      messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to upload file. Please try again.", threadID, messageID);
  }
};
