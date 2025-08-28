const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "upt",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  usePrefix: true,
  description: "Bot status image",
  commandCategory: "system",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  try {
    // Background photo (catch file)
    const bgPath = path.join(__dirname, "cache", "status_bg.png"); 
    const bgImage = await loadImage(bgPath);

    // Canvas create
    const canvas = createCanvas(bgImage.width, bgImage.height);
    const ctx = canvas.getContext("2d");

    // Background draw
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Text style setup
    ctx.fillStyle = "#FFFFFF"; 
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "left";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 6;

    // Uptime calculate
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const ping = Date.now() - event.timestamp;
    const owner = "ANIK";

    // Top title
    ctx.textAlign = "center";
    ctx.font = "bold 50px Arial";
    ctx.fillText("⚡ BOT STATUS ⚡", canvas.width / 2, 80);

    // Details text
    ctx.textAlign = "left";
    ctx.font = "bold 38px Arial";

    ctx.fillText(`🕒 UPTIME : ${hours}h ${minutes}m ${seconds}s`, 220, 180);
    ctx.fillText(`📶 PING   : ${ping}ms`, 220, 250);
    ctx.fillText(`👑 OWNER  : ${owner}`, 220, 320);

    // Save temp file
    const outPath = path.join(__dirname, "cache", `status_${event.senderID}.png`);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outPath, buffer);

    // Send photo
    return api.sendMessage(
      { body: "", attachment: fs.createReadStream(outPath) },
      event.threadID,
      () => fs.unlinkSync(outPath),
      event.messageID
    );

  } catch (err) {
    console.log(err);
    return api.sendMessage("❌ Error while generating status photo!", event.threadID, event.messageID);
  }
};
