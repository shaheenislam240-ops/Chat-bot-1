const axios = require("axios");
const deepaiKey = "13ca915b-7504-48bf-8765-086fc5907998";

module.exports.config = {
  name: "refine",
  version: "2.0",
  hasPermssion: 0,
  credits: "Md Abdullah",
  description: "Image editing with DeepAI (HD, cartoon, colorize, refine)",
  commandCategory: "AI",
  usages: "[hd/cartoon/colorize/reimagine/refine] [prompt]",
  cooldowns: 5,
};

const apiMap = {
  hd: "https://api.deepai.org/api/torch-srgan",
  cartoon: "https://api.deepai.org/api/toonify",
  colorize: "https://api.deepai.org/api/colorizer",
  reimagine: "https://api.deepai.org/api/text2img",
  refine: "https://api.deepai.org/api/text2img",
};

module.exports.run = async function ({ api, event, args }) {
  const type = args[0]?.toLowerCase();
  const prompt = args.slice(1).join(" ") || "Make it artistic";
  const imageUrl = event.messageReply?.attachments?.[0]?.url;

  if (!["hd", "cartoon", "colorize", "reimagine", "refine"].includes(type)) {
    return api.sendMessage(
      "❌ Invalid command!\n\n✅ Use:\n• refine hd\n• refine cartoon\n• refine colorize\n• refine reimagine [prompt]\n• refine refine [prompt]",
      event.threadID,
      event.messageID
    );
  }

  if ((type === "reimagine" || type === "refine") && !prompt) {
    return api.sendMessage("❌ Please provide a prompt for reimagine/refine.", event.threadID, event.messageID);
  }

  if (!imageUrl && type !== "reimagine" && type !== "refine") {
    return api.sendMessage("❌ Please reply to an image to edit.", event.threadID, event.messageID);
  }

  const apiUrl = apiMap[type];

  try {
    const payload =
      type === "reimagine" || type === "refine"
        ? { text: prompt }
        : { image: imageUrl };

    const res = await axios.post(apiUrl, payload, {
      headers: { "Api-Key": deepaiKey },
    });

    const outUrl = res.data.output_url;

    if (outUrl) {
      const imgStream = (await axios.get(outUrl, { responseType: "stream" })).data;
      return api.sendMessage({ attachment: imgStream }, event.threadID, event.messageID);
    } else {
      return api.sendMessage("❌ Couldn't process the image. Try again.", event.threadID, event.messageID);
    }
  } catch (err) {
    return api.sendMessage("❌ API error occurred. Please try again later.", event.threadID, event.messageID);
  }
};
