const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

module.exports.config = {
  name: "catbox",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "RX Abdullah",
  description: "Upload replied audio/video to Catbox and return link",
  commandCategory: "tools",
  usages: "[reply to audio or video] !catbox",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const { messageReply, threadID, messageID } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an audio or video file.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  const url = attachment.url;
  const type = attachment.type;

  let ext;
  if (type === "audio") ext = ".mp3";
  else if (type === "video") ext = ".mp4";
  else return api.sendMessage("❌ Only audio or video files are supported.", threadID, messageID);

  const filePath = __dirname + `/cache/catbox${ext}`;

  try {
    const res = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);

    writer.on("finish", async () => {
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(filePath));

      try {
        const upload = await axios.post("https://catbox.moe/user/api.php", form, {
          headers: form.getHeaders()
        });

        fs.unlinkSync(filePath);
        return api.sendMessage(`✅ File uploaded:\n${upload.data}`, threadID, messageID);
      } catch (err) {
        fs.unlinkSync(filePath);
        return api.sendMessage("❌ Upload failed. Try again later.", threadID, messageID);
      }
    });

    writer.on("error", () => {
      fs.unlinkSync(filePath);
      return api.sendMessage("❌ File write error.", threadID, messageID);
    });
  } catch (e) {
    return api.sendMessage("❌ Download failed. Try again.", threadID, messageID);
  }
};
