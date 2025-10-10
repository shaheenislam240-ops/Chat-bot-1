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
  credits: "rX Abdullah & dipto",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube (auto first result)",
  commandCategory: "media",
  usages: "{pn} [song name or YouTube link]",
};

module.exports.run = async ({ api, args, event }) => {
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

  if (!args[0])
    return api.sendMessage("🎵 Please provide a song name or YouTube link.", event.threadID, event.messageID);

  // Send searching message
  const searchingMsg = await api.sendMessage("🔍 Searching...", event.threadID);

  try {
    let videoID;
    const urlYtb = checkurl.test(args[0]);

    // Direct YouTube link case
    if (urlYtb) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;

      const { data: { title, downloadLink, quality } } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
      );

      await api.unsendMessage(searchingMsg.messageID);
      return api.sendMessage({
        body: `🎧 ${title}\nQuality: ${quality}`,
        attachment: await dipto(downloadLink, 'audio.mp3'),
      }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);
    }

    // Search by keyword
    let keyWord = args.join(" ");
    keyWord = keyWord.replace("?feature=share", "");

    const result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${keyWord}`)).data;

    if (!result || result.length === 0) {
      await api.unsendMessage(searchingMsg.messageID);
      return api.sendMessage("❌ No results found for your keyword.", event.threadID, event.messageID);
    }

    const firstResult = result[0];
    const idvideo = firstResult.id;

    const { data: { title, downloadLink, quality } } = await axios.get(
      `${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`
    );

    await api.unsendMessage(searchingMsg.messageID);

    await api.sendMessage({
      body: `🎶 Title: ${title}\n📺 Channel: ${firstResult.channel.name}\n🎧 Quality: ${quality}`,
      attachment: await dipto(downloadLink, 'audio.mp3'),
    }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);

  } catch (err) {
    console.error(err);
    await api.unsendMessage(searchingMsg.messageID);
    return api.sendMessage("⚠️ Error while fetching or sending audio.", event.threadID, event.messageID);
  }
};

async function dipto(url, pathName) {
  try {
    const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathName, Buffer.from(response));
    return fs.createReadStream(pathName);
  } catch (err) {
    throw err;
  }
}
