const fs = require("fs");
const path = require("path");
const axios = require("axios");

const apiJsonURL = "https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json";

module.exports.config = {
  name: "maria",
  version: "2.2.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Send random Maria GIF and smart reply using maria API key",
  commandCategory: "fun",
  usages: "Maria",
  cooldowns: 5,
  usePrefix: false
};

// 🔹 RX API fetcher (maria key use)
async function getMariaAPI() {
  try {
    const res = await axios.get(apiJsonURL);
    if (res.data && res.data.maria) return res.data.maria;
    throw new Error("❌ 'maria' key not found in baseApiUrl.json");
  } catch (err) {
    console.error("⚠️ Failed to fetch Maria API:", err.message);
    return null;
  }
}

// 🔹 Unique invisible marker for Maria only
// "\u200B" এর বদলে "maria" code সহ দিচ্ছি যাতে unique থাকে
const mariaMarker = "\u200B_MARIA_";

function withMariaMarker(text) {
  return text + mariaMarker;
}

module.exports.handleEvent = async function ({ api, event, Users }) {
  const { threadID, messageID, body, senderID, messageReply } = event;
  if (!body) return;

  const name = await Users.getNameUser(senderID);
  const cacheDir = path.join(__dirname, "cache");
  const gifList = ["m1.gif", "m2.gif", "m3.gif", "m4.gif", "m5.gif"];

  // 🔹 Step 1: যদি message এ "Maria" থাকে
  if (body.toLowerCase().includes("maria")) {
    const randomGif = gifList[Math.floor(Math.random() * gifList.length)];
    const gifPath = path.join(cacheDir, randomGif);

    if (!fs.existsSync(gifPath)) {
      return api.sendMessage(`❌ ${randomGif} cache folder e paoa jay nai!`, threadID, messageID);
    }

    return api.sendMessage(
      {
        body: withMariaMarker("𝐌𝐚𝐫𝐢𝐚 ᰔ☯︎"),
        attachment: fs.createReadStream(gifPath)
      },
      threadID,
      messageID
    );
  }

  // 🔹 Step 2: যদি কেউ Maria message-এ reply দেয়
  if (
    messageReply &&
    messageReply.senderID === api.getCurrentUserID() &&
    messageReply.body?.includes(mariaMarker)
  ) {
    const replyText = body.trim();
    if (!replyText) return;

    const mariaAPI = await getMariaAPI();
    if (!mariaAPI)
      return api.sendMessage("❌ Maria API load korte parlam na.", threadID, messageID);

    try {
      const res = await axios.get(
        `${mariaAPI}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(name)}`
      );

      const responses = Array.isArray(res.data.response)
        ? res.data.response
        : [res.data.response];

      for (const reply of responses) {
        await new Promise(resolve => {
          api.sendMessage(withMariaMarker(reply), threadID, () => resolve(), messageID);
        });
      }
    } catch (err) {
      console.error("Maria reply error:", err.message);
      return api.sendMessage(`⚠️ Error: ${err.message}`, threadID, messageID);
    }
  }
};

module.exports.run = async () => {};
