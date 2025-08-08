const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "getpix",
  version: "1.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Download and send video from Pixeldrain UID or link",
  commandCategory: "media",
  usages: "[Pixeldrain UID or Link]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const input = args[0];
  if (!input) return api.sendMessage("❌ Please provide a Pixeldrain UID or full link.", event.threadID, event.messageID);

  let fileID;

  if (input.includes("pixeldrain.com/u/")) {
    fileID = input.split("/u/")[1].split(/[?#]/)[0];
  } else {
    fileID = input;
  }

  const downloadURL = `https://pixeldrain.com/api/file/${fileID}/download`;
  const filePath = path.join(__dirname, "cache", `${fileID}.mp4`);

  try {
    const response = await axios({
      method: "GET",
      url: downloadURL,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `📥 Pixeldrain video loaded!\n🆔 UID: ${fileID}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
    });

    writer.on("error", (err) => {
      console.log(err);
      api.sendMessage("❌ Error saving video file.", event.threadID, event.messageID);
    });

  } catch (err) {
    console.error(err.message);
    api.sendMessage("❌ Failed to fetch or download the video.", event.threadID, event.messageID);
  }
};
