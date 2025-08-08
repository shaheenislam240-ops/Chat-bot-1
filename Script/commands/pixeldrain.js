const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "pixeldrain",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Priyansh",
  description: "Upload, list & delete videos via Pixeldrain API",
  commandCategory: "media",
  usages: "[upload | list | delete] [reply/file_id]",
  cooldowns: 3
};

const API_KEY = "11379c5d-5de2-42b5-b1e2-8a378e3c2812";
const API_BASE = "https://pixeldrain.com/api/v1";

module.exports.run = async function ({ api, event, args }) {
  const { messageID, threadID, senderID, type, messageReply } = event;
  const subcommand = args[0];

  // ➤ Uploading File
  if (subcommand === "upload") {
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0)
      return api.sendMessage("❌ Reply to a video or file to upload.", threadID, messageID);

    const fileUrl = messageReply.attachments[0].url;
    const fileName = path.basename(fileUrl);
    const filePath = __dirname + `/cache/${fileName}`;

    try {
      const res = await axios.get(fileUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      res.data.pipe(writer);

      writer.on("finish", async () => {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));
        const headers = {
          ...formData.getHeaders(),
          Authorization: `Bearer ${API_KEY}`
        };

        const uploadRes = await axios.post(`${API_BASE}/file`, formData, { headers });
        const { id, name, size, views, bandwidth_used } = uploadRes.data;

        api.sendMessage(
          `✅ Uploaded!\n━━━━━━━━━━━━━━\n📁 Name: ${name}\n🆔 ID: ${id}\n📎 Size: ${(size / 1048576).toFixed(2)} MB\n🔗 Link: https://pixeldrain.com/u/${id}`,
          threadID,
          messageID
        );

        fs.unlinkSync(filePath);
      });
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ Upload failed!", threadID, messageID);
    }
  }

  // ➤ List Files
  else if (subcommand === "list") {
    try {
      const res = await axios.get(`${API_BASE}/user/files?limit=10`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      const files = res.data.files;
      if (!files.length) return api.sendMessage("❌ No uploaded files found!", threadID, messageID);

      const listText = files.map((file, i) => {
        return `📁 ${i + 1}. ${file.name}\n🆔 ID: ${file.id}\n🔗 Link: https://pixeldrain.com/u/${file.id}\n━━━━━━━━━━━━━━`;
      }).join("\n");

      api.sendMessage(`📤 Your Uploaded Files:\n\n${listText}`, threadID, messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to fetch file list.", threadID, messageID);
    }
  }

  // ➤ Delete File
  else if (subcommand === "delete") {
    const fileID = args[1];
    if (!fileID) return api.sendMessage("❌ Please provide a file ID to delete.\nUsage: pixeldrain delete <file_id>", threadID, messageID);

    try {
      await axios.delete(`${API_BASE}/file/${fileID}`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      api.sendMessage(`🗑️ File with ID '${fileID}' deleted successfully.`, threadID, messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to delete file. Make sure ID is correct.", threadID, messageID);
    }
  }

  // ➤ Help / Invalid Command
  else {
    api.sendMessage(
      `🛠️ Pixeldrain Command Usage:\n\n` +
      `📤 Upload File: reply to video or file and type:\n→ pixeldrain upload\n\n` +
      `📄 List Files:\n→ pixeldrain list\n\n` +
      `🗑️ Delete File:\n→ pixeldrain delete <file_id>`,
      threadID,
      messageID
    );
  }
};
