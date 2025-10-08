const axios = require("axios");
const fs = require("fs");

// 🔹 Base API URL JSON (GitHub থেকে fetch করবে)
const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json"
  );
  return base.data.api; // key name 'api' ব্যবহার করো
};

module.exports.config = {
  name: "sing",
  version: "2.2.0",
  aliases: ["music", "play"],
  credits: "rX Abdullah",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube",
  commandCategory: "media",
  usages: "{pn} [<song name>|<song link>]:\nExample:\n{pn} chipi chipi chapa chapa",
};

module.exports.run = async ({ api, args, event }) => {
  const checkurl =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

  const isUrl = checkurl.test(args[0]);
  let videoID;

  if (isUrl) {
    const match = args[0].match(checkurl);
    videoID = match ? match[1] : null;

    const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`);
    const { title, downloadLink } = data;

    return api.sendMessage(
      {
        body: title,
        attachment: fs.createReadStream(await downloadAudio(downloadLink, "audio.mp3")),
      },
      event.threadID,
      () => fs.unlinkSync("audio.mp3"),
      event.messageID
    );
  }

  // যদি keyword দিয়ে search করে
  let keyWord = args.join(" ").replace("?feature=share", "");
  let results;

  try {
    results = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${keyWord}`)).data.slice(0, 6);
  } catch (err) {
    return api.sendMessage("❌ An error occurred: " + err.message, event.threadID, event.messageID);
  }

  if (!results || results.length === 0)
    return api.sendMessage("⭕ No search results match the keyword: " + keyWord, event.threadID, event.messageID);

  let msg = "";
  results.forEach((video, i) => {
    msg += `${i + 1}. ${video.title}\nTime: ${video.time}\nChannel: ${video.channel.name}\n\n`;
  });

  api.sendMessage(
    {
      body: msg + "Reply with the number you want to listen to",
    },
    event.threadID,
    (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
        result: results,
      });
    },
    event.messageID
  );
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
  try {
    const { result } = handleReply;
    const choice = parseInt(event.body);

    if (isNaN(choice) || choice < 1 || choice > result.length)
      return api.sendMessage("❌ Invalid choice. Enter a number between 1 and 6.", event.threadID, event.messageID);

    const infoChoice = result[choice - 1];
    const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${infoChoice.id}&format=mp3`);
    const { title, downloadLink, quality } = data;

    await api.unsendMessage(handleReply.messageID);
    await api.sendMessage(
      {
        body: `• Title: ${title}\n• Quality: ${quality}`,
        attachment: fs.createReadStream(await downloadAudio(downloadLink, "audio.mp3")),
      },
      event.threadID,
      () => fs.unlinkSync("audio.mp3"),
      event.messageID
    );
  } catch (err) {
    console.log(err);
    api.sendMessage("⭕ Something went wrong or audio size > 26MB", event.threadID, event.messageID);
  }
};

// 🔹 Helper: download audio temporarily
async function downloadAudio(url, fileName) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(fileName, response.data);
  return fileName;
}
