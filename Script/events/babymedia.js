const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "babymedia",
  version: "1.0.0",
  credits: "RX Abdullah",
  description: "Trigger-based audio/video from API",
  dependencies: {},
  prefix: false
};

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body || event.body.length > 30 || event.isGroup == false) return;

  const keyword = event.body.trim().toLowerCase();

  try {
    const res = await axios.get(`https://rx-cloud-api.onrender.com/get/${encodeURIComponent(keyword)}`);
    const { title, url } = res.data;

    // Only respond if exact match
    if (keyword !== title.toLowerCase().trim()) return;

    const ext = path.extname(url).split("?")[0];
    const fileName = `cache/temp${ext}`;
    const file = (await axios.get(url, { responseType: "arraybuffer" })).data;

    fs.writeFileSync(fileName, Buffer.from(file, "binary"));

    api.sendMessage({
      body: `🎵 ${title}`,
      attachment: fs.createReadStream(fileName)
    }, event.threadID, () => fs.unlinkSync(fileName), event.messageID);

  } catch (err) {
    // No matching keyword found, no reply
  }
};
