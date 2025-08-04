module.exports.config = {
  name: "rumana",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send video when someone says 'rumana'",
  commandCategory: "auto-response",
  usages: "Just say: rumana",
  cooldowns: 2,
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const trigger = event.body?.toLowerCase();
    if (trigger === "rumana") {
      const url = "https://i.imgur.com/FcSfdXb.mp4";
      api.sendMessage(
        {
          body: "🥵 Here's your Rumana clip!",
          attachment: await global.utils.getStreamFromURL(url),
        },
        event.threadID,
        event.messageID
      );
    }
  } catch (e) {
    console.error("Error in rumana.js:", e);
  }
};

module.exports.run = async function () {};
