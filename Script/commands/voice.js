const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "voice",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Trigger-based voice reply from your API",
  commandCategory: "media",
  usages: "no command, trigger-based",
  cooldowns: 0,
  prefix: false
};

module.exports.handleEvent = async function ({ api, event }) {
  const trigger = event.body?.toLowerCase().trim();
  if (!trigger) return;

  // ✅ Add your trigger words here (same name as voice files)
  const validTriggers = ["sleep", "tune"];

  if (!validTriggers.includes(trigger)) return;

  try {
    const url = `https://rx-maria.onrender.com/getVoice?query=${encodeURIComponent(trigger)}`;
    const filePath = path.join(__dirname, "cache", `${trigger}.mp3`);

    const response = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));
    });

  } catch (err) {
    console.error("Voice API Error:", err.message);
    api.sendMessage("❌ Voice load korte parlam na.", event.threadID);
  }
};

module.exports.run = async () => {};
