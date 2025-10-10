const axios = require("axios");
const fs = require('fs');

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports.config = {
  name: "song",
  version: "2.2.0",
  aliases: ["music", "play"],
  credits: "rX", // api from dipto
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube (auto download first result)",
  commandCategory: "media",
  usages: "{pn} [<song name>|<song link>]\nExample:\n{pn} chipi chipi chapa chapa"
};

module.exports.run = async ({ api, args, event }) => {
  const { threadID, messageID, senderID } = event;
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  
  // Reaction: 🔍 on user message
  api.setMessageReaction("🔍", event.messageID, () => {}, true);

  // Send Searching message
  const searching = await api.sendMessage("🔍 Searching...", threadID);

  let videoID;
  const urlYtb = checkurl.test(args[0]);
  const limitBytes = 26 * 1024 * 1024; // 26MB

  try {
    if (urlYtb) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;
    } else {
      const keyWord = args.join(" ");
      if (!keyWord) {
        await api.unsendMessage(searching.messageID);
        return api.sendMessage("❌ Please provide a song name or YouTube link.", threadID, messageID);
      }

      const result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data;
      if (!result.length) {
        await api.unsendMessage(searching.messageID);
        return api.sendMessage(`⭕ No search results for: ${keyWord}`, threadID, messageID);
      }

      // Take first result
      videoID = result[0].id;
    }

    const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`);
    const { title, downloadLink, quality } = data;
    const path = `audio_${videoID}.mp3`;

    const res = await axios.get(downloadLink, { responseType: "arraybuffer" });
    const fileSize = Buffer.byteLength(res.data);

    if (fileSize > limitBytes) {
      await api.unsendMessage(searching.messageID);
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);
      return api.sendMessage("⭕ File size exceeds 26MB. Cannot send on Messenger.", threadID, messageID);
    }

    fs.writeFileSync(path, Buffer.from(res.data));

    await api.unsendMessage(searching.messageID);
    await api.setMessageReaction("✅", event.messageID, () => {}, true);

    await api.sendMessage({
      body: `🎵 Title: ${title}\n🎚 Quality: ${quality}`,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (err) {
    console.error(err);
    await api.unsendMessage(searching.messageID);
    api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
  }
};
