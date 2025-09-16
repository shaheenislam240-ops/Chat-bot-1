const axios = require("axios");

const API_BASE = "https://rx-simisimi-api-tllc.onrender.com";

module.exports.config = {
  name: "simsimi",
  version: "1.1.0",
  credits: "rX Abdullah",
  description: "Talk with AI (teach system supported)",
  usages: "!simsimi [text] or !simi teach ask - ans, ask - ans",
  commandCategory: "chat",
  cooldowns: 2,
};

// simsimi talk
module.exports.run = async ({ api, event, args }) => {
  try {
    const text = args.join(" ");
    if (!text) return api.sendMessage("⚠️ Provide text.", event.threadID, event.messageID);

    // যদি teach কমান্ড হয়
    if (text.toLowerCase().startsWith("teach ")) {
      const teaches = text.slice(6).split(","); // কমা দিয়ে আলাদা করা

      let results = [];
      for (let t of teaches) {
        const [ask, ans] = t.split("-").map(x => x.trim());
        if (!ask || !ans) continue;

        try {
          const res = await axios.get(
            `${API_BASE}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderName=${encodeURIComponent(event.senderID)}`
          );
          results.push(`🔹 ${ask} → ${ans} ✅`);
        } catch {
          results.push(`🔸 ${ask} → ❌ Error`);
        }
      }

      return api.sendMessage(
        `📚 Multi Teach Result:\n${results.join("\n")}`,
        event.threadID,
        event.messageID
      );
    }

    // সাধারণ simsimi reply
    const res = await axios.get(`${API_BASE}/simsimi?text=${encodeURIComponent(text)}`);
    const reply = res.data.response || "😶 No response found.";
    api.sendMessage(reply, event.threadID, event.messageID);

  } catch (err) {
    api.sendMessage("⚠️ Error in Simsimi system.", event.threadID, event.messageID);
  }
};
