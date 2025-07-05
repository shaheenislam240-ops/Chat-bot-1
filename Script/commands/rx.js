module.exports.config = {
  name: "rx",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send random rX video",
  commandCategory: "video",
  usages: "",
  cooldowns: 3,
  usePrefix: true
};

module.exports.run = async ({ api, event }) => {
  const videos = [
    "https://files.catbox.moe/2alll5.mov"
  ];

  const randomVideo = videos[Math.floor(Math.random() * videos.length)];

  return api.sendMessage({
    body: "🎬 Video from rX",
    attachment: await global.utils.getStreamFromURL(randomVideo)
  }, event.threadID, event.messageID);
};
