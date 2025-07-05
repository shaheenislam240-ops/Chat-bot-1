const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "rx",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send random Islamic video",
  commandCategory: "video",
  usages: "",
  cooldowns: 2,
  dependencies: {
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.run = async function ({ api, event }) {
  const videoLinks = [
    "https://i.imgur.com/8kzBGia.mp4",
    "https://i.imgur.com/Y6WJ9vF.mp4"
  ];

  const filePath = __dirname + "/cache/1.mp4";
  const randomLink = videoLinks[Math.floor(Math.random() * videoLinks.length)];

  const message = `🎬 Video from rX`;

  axios.get(randomLink, { responseType: "stream" }).then(response => {
    response.data.pipe(fs.createWriteStream(filePath)).on("close", () => {
      api.sendMessage({
        body: message,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath));
    });
  });
};
