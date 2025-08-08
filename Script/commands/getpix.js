const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "getpix",
  version: "1.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Download and send video from Pixeldrain using file ID",
  commandCategory: "media",
  usages: "[fileID]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const fileID = args[0];
  if (!fileID) return api.sendMessage("❌ Please provide a Pixeldrain file ID!", event.threadID, event.messageID);

  const downloadURL = `https://pixeldrain.com/api/file/${fileID}?download`;
  const cacheDir = path.join(__dirname, "cache");
  const filePath = path.join(cacheDir, `${fileID}.mp4`);

  try {
    await fs.ensureDir(cacheDir);

    const response = await axios({
      url: downloadURL,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `🎬 Here's your video from Pixeldrain! ID: ${fileID}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
    });

    writer.on("error", (error) => {
      console.error(error);
      api.sendMessage("❌ Error saving the video file.", event.threadID, event.messageID);
    });

  } catch (error) {
    console.error(error.message);
    api.sendMessage("❌ Failed to download the video. Please check the file ID.", event.threadID, event.messageID);
  }
};
