const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "message",
  version: "3.1.0",
  hasPermssion: 2,
  credits: "rX Abdullah",
  description: "Send announcement with optional image (from reply) to all groups",
  commandCategory: "system",
  usages: "[your message] (reply to photo optional)",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const input = args.join(" ");
  if (!input) {
    return api.sendMessage("📢 Use like this:\n!message [your message]\n(Reply to photo optional)", event.threadID, event.messageID);
  }

  const title = "📣 ANNOUNCEMENT";
  const msg =
`╭──── [ ${title} ] ────╮

${input}

╰────────────────────────────╯`;

  // Check for replied image
  let attachment = [];
  if (event.messageReply && event.messageReply.attachments.length > 0) {
    const image = event.messageReply.attachments[0];
    if (image.type === "photo") {
      const imgPath = path.join(__dirname, "cache", `${Date.now()}.jpg`);
      const res = await axios.get(image.url, { responseType: "arraybuffer" });
      fs.ensureDirSync(path.dirname(imgPath));
      fs.writeFileSync(imgPath, Buffer.from(res.data, "binary"));
      attachment.push(fs.createReadStream(imgPath));
    }
  }

  try {
    const threads = await api.getThreadList(100, null, ["INBOX"]);
    const groupThreads = threads.filter(t => t.isGroup);
    let count = 0;

    for (const thread of groupThreads) {
      try {
        await api.sendMessage({ body: msg, attachment }, thread.threadID);
        count++;
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        console.log(`❌ Failed to send in: ${thread.threadID}`);
      }
    }

    return api.sendMessage(`✅ Message sent to ${count} groups.`, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Something went wrong.", event.threadID, event.messageID);
  }
};
