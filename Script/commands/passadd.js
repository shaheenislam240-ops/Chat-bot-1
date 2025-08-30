const axios = require("axios");

module.exports = {
  name: "passadd",
  description: "Teach password to API",
  usage: "!passadd keyword1 - keyword2, password",
  cooldown: 5,         // 5 seconds cooldown
  credits: "Rx Abdullah",
  prefix: "!",          // optional, can support multiple prefixes
  execute: async (bot, message) => {
    const text = message.message;
    const groupId = message.group?.id;
    const senderId = message.sender.id;

    if (!text.startsWith("!passadd ")) return;

    const content = text.replace("!passadd ", "").trim();
    const [keywordsPart, password] = content.split(",");
    if (!keywordsPart || !password) {
      const reply = `❌ Invalid format.\nUsage: ${module.exports.usage}`;
      if (groupId) await bot.sendGroupMessage(groupId, reply);
      else await bot.sendPrivateMessage(senderId, reply);
      return;
    }

    const keywords = keywordsPart.split("-").map(k => k.trim());

    try {
      const resApi = await axios.post(`https://password-by-rx-cn1o.onrender.com/add-passwords`, {
        keywords,
        password: password.trim()
      });

      const reply = resApi.data.results.map(r => {
        if (r.status === "added") return `✅ ${r.keyword}: added`;
        if (r.status === "exists") return `⚠️ ${r.keyword}: already exists`;
        return `❌ ${r.keyword}: error`;
      }).join("\n");

      if (groupId) await bot.sendGroupMessage(groupId, reply);
      else await bot.sendPrivateMessage(senderId, reply);

    } catch (err) {
      const reply = `❌ Error: ${err.response?.data?.error || err.message}`;
      if (groupId) await bot.sendGroupMessage(groupId, reply);
      else await bot.sendPrivateMessage(senderId, reply);
    }
  }
};
