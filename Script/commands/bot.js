const axios = require("axios");

module.exports.handleEvent = async function({ api, event, Users }) {
  const { threadID, messageID, body, senderID } = event;
  
  if (!body) return;
  if (body.trim().toLowerCase() !== "bot") return;

  const name = await Users.getNameUser(senderID);

  try {
    // তোমার baby API কল
    const res = await axios.get(`https://rx-simisimi-api-tllc.onrender.com/baby?name=${encodeURIComponent(name)}`);
    const replyFromAPI = res.data.reply; // ধরছি API থেকে reply আসছে { reply: "..." }

    const message =
`╭──────•◈•──────╮
   Hᴇʏ Xᴀɴ I’ᴍ Mᴀʀɪᴀ Bᴀʙʏ✨   

 ❄ Dᴇᴀʀ, ${name}
 💌 ${replyFromAPI}

╰──────•◈•──────╯`;

    return api.sendMessage(message, threadID, messageID);
  } catch (err) {
    console.error(err);
  }
};
