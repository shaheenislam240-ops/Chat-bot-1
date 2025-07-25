const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "babylove",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "RX Abdullah",
  description: "Multi auto voice response on trigger",
  commandCategory: "auto",
  usages: "",
  cooldowns: 0,
  prefix: false
};

const songProgress = {};

const triggers = [
  {
    keywords: ["ghumabo"],
    audioUrl: "https://files.catbox.moe/us0nva.mp3",
    reply: "😴 Okaay baby, sweet dreams 🌙",
    fileName: "ghumabo.mp3"
  },
  {
    keywords: ["ringtone"],
    audioUrl: "https://files.catbox.moe/ga798u.mp3",
    reply: "💖ay lo. Baby!",
    fileName: "bhalobashi.mp3"
  },
  {
    keywords: ["bby explain"],
    audioUrl: "https://files.catbox.moe/ijgma4.mp3",
    reply: "📝 go away!",
    fileName: "explain.mp3"
  }
];

const deepSongs = [
  { url: "https://files.catbox.moe/uodwqm.mp3", title: "🎵 Ei ta tmr jonno" },
  { url: "https://files.catbox.moe/v4i4uc.mp3", title: "🎶 Ekhane ami bolchi kmn" },
  { url: "https://files.catbox.moe/tbdd6q.mp3", title: "🎧kmn Hoise" },
  { url: "https://files.catbox.moe/5m6t42.mp3", title: "🔥 Created by rX" },
  { url: "https://files.catbox.moe/ag634t.mp3", title: "💥 Created by maria" }
];

module.exports.handleEvent = async function({ api, event }) {
  const msg = event.body?.toLowerCase();
  if (!msg) return;

  const threadID = event.threadID;
  const messageID = event.messageID;

  if (event.type === "message_reply" && ["next", "arekta"].includes(msg.trim())) {
    const repliedMsgID = event.messageReply?.messageID;
    const progress = songProgress[threadID];
    if (!progress) return;
    if (progress.msgID !== repliedMsgID) return;

    const nextIndex = progress.index + 1;
    if (nextIndex >= deepSongs.length) {
      api.sendMessage("😅 Shesh! Aar gaan nai.", threadID);
      delete songProgress[threadID];
      return;
    }

    await sendSong(api, threadID, nextIndex, messageID);
    return;
  }

  for (const trigger of triggers) {
    if (trigger.keywords.some(k => msg.includes(k))) {
      const filePath = path.join(__dirname, trigger.fileName);
      try {
        const res = await axios.get(trigger.audioUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));
        api.sendMessage({
          body: trigger.reply,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath));
      } catch (e) {
        console.log(`❌ Failed to send audio for "${trigger.keywords[0]}":`, e.message);
      }
      return;
    }
  }

  if (msg.includes("ekta gan bolo")) {
    await sendSong(api, threadID, 0, messageID);
    return;
  }
};

async function sendSong(api, threadID, index, replyToID) {
  const song = deepSongs[index];
  const fileName = `song_${index}.mp3`;
  const filePath = path.join(__dirname, fileName);

  try {
    const res = await axios.get(song.url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));

    api.sendMessage({
      body: song.title,
      attachment: fs.createReadStream(filePath)
    }, threadID, (err, info) => {
      fs.unlinkSync(filePath);
      if (!err) {
        songProgress[threadID] = { index, msgID: info.messageID };
      }
    });
  } catch (e) {
    console.log("❌ Error sending song:", e.message);
  }
}

module.exports.run = () => {};
