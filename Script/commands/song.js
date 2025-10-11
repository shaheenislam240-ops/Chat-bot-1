const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports.config = {
  name: "song",
  version: "2.3.0",
  aliases: ["music", "play"],
  credits: "𝐫𝐗", //special thanks to dipto ===api from dipto===
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

  const searchingMsg = await api.sendMessage("🎀 <\n 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭...", event.threadID);
  await api.setMessageReaction("🔍", searchingMsg.messageID); // React search

  try {
    let videoID;
    const urlYtb = checkurl.test(args[0]);

    if (urlYtb) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;

      const { data: { title, downloadLink, quality } } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
      );

      await api.unsendMessage(searchingMsg.messageID);

      const sentMsg = await api.sendMessage({
        body: `🎧 Title: ${title}\n🎶 Quality: ${quality}`,
        attachment: await downloadAudio(downloadLink, 'audio.mp3')
      }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);

      await api.setMessageReaction("✅", sentMsg.messageID); // React success
      return;
    }

    // Keyword search
    let keyWord = args.join(" ").replace("?feature=share", "");
    const encodedKeyword = encodeURIComponent(keyWord);
    const result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodedKeyword}`)).data;

    if (!result || result.length === 0) {
      await api.unsendMessage(searchingMsg.messageID);
      return api.sendMessage(`❌ No results found for '${keyWord}'.`, event.threadID, event.messageID);
    }

    const firstResult = result[0];
    const idvideo = firstResult.id;

    const { data: { title, downloadLink, quality } } = await axios.get(
      `${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`
    );

    await api.unsendMessage(searchingMsg.messageID);

    const sentMsg = await api.sendMessage({
      body: `🎧 Title: ${title}\n📺 Channel: ${firstResult.channel.name}\n🎶 Quality: ${quality}`,
      attachment: await downloadAudio(downloadLink, 'audio.mp3')
    }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);

    await api.setMessageReaction("✅", sentMsg.messageID);

  } catch (err) {
    console.error(err);
    await api.unsendMessage(searchingMsg.messageID);
    return api.sendMessage("⚠️ Error while fetching or sending audio.", event.threadID, event.messageID);
  }
};

async function downloadAudio(url, pathName) {
  const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathName, Buffer.from(response));
  return fs.createReadStream(pathName);
}
