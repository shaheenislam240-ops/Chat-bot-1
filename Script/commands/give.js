const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "give",
  version: "1.1",
  hasPermssion: 2,
  credits: "Shaon Ahmed | Modified by rX Abdullah",
  description: "Upload local command files to a pastebin service.",
  commandCategory: "utility",
  usages: "[filename] [raw]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  if (args.length === 0) 
    return api.sendMessage("📁 Please provide a file name.\nUsage: !give <filename> [raw]", event.threadID, event.messageID);

  const fileName = args[0];
  const isRaw = args[1] && args[1].toLowerCase() === "raw";

  const commandsPath = path.join(__dirname, "..", "commands");
  const filePath1 = path.join(commandsPath, fileName);
  const filePath2 = path.join(commandsPath, fileName + ".js");

  let fileToRead;
  if (fs.existsSync(filePath1)) {
    fileToRead = filePath1;
  } else if (fs.existsSync(filePath2)) {
    fileToRead = filePath2;
  } else {
    return api.sendMessage("❌ File not found in `commands` folder.", event.threadID, event.messageID);
  }

  fs.readFile(fileToRead, "utf8", async (err, data) => {
    if (err) {
      console.error("❗ Read error:", err);
      return api.sendMessage("❗ Error reading the file.", event.threadID, event.messageID);
    }
    try {
      api.sendMessage("📤 Uploading file to PasteBin, please wait...", event.threadID, async (error, info) => {
        if (error) return console.error(error);

        const pastebinAPI = "https://pastebin-api.vercel.app";
        const response = await axios.post(`${pastebinAPI}/paste`, { text: data });

        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 1000);

        if (response.data && response.data.id) {
          const link = isRaw 
            ? `${pastebinAPI}/raw/${response.data.id}` 
            : `${pastebinAPI}/${response.data.id}`;

          return api.sendMessage(
            `📄 File: ${path.basename(fileToRead)}\n✅ Successfully uploaded:\n🔗 ${link}`,
            event.threadID
          );
        } else {
          console.error("⚠️ Unexpected API response:", response.data);
          return api.sendMessage("⚠️ Upload failed. No valid ID received from PasteBin server.", event.threadID);
        }
      });
    } catch (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return api.sendMessage("❌ Failed to upload file:\n" + uploadError.message, event.threadID);
    }
  });
};
