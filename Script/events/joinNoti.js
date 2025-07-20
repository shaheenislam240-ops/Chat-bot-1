const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const jimp = require("jimp");
const request = require("request");

module.exports.config = {
  name: "join",
  eventType: ["log:subscribe"],
  version: "1.0.1",
  credits: "RX Abdullah + ChatGPT",
  description: "Welcome image using pp.js photo system"
};

module.exports.run = async function ({ api, event }) {
  const addedUser = event.logMessageData.addedParticipants[0];
  const uid = addedUser.userFbId;
  const userName = addedUser.fullName;
  const threadInfo = await api.getThreadInfo(event.threadID);
  const memberCount = threadInfo.participantIDs.length;
  const groupName = threadInfo.threadName || "this group";

  const basePath = path.join(__dirname, "cache");
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

  const bgUrl = "https://i.postimg.cc/QtnYCz75/IMG-6833.jpg";
  const bgPath = path.join(basePath, "bg.jpg");
  const avatarPath = path.join(basePath, `avt_${uid}.png`);
  const finalPath = path.join(basePath, `welcome_${uid}.png`);

  try {
    // Download background image
    const bgImg = await fetchImage(bgUrl);
    fs.writeFileSync(bgPath, bgImg);

    // === Download profile photo using pp.js style ===
    const avatarURL = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
    await new Promise((resolve, reject) => {
      request(avatarURL)
        .pipe(fs.createWriteStream(avatarPath))
        .on("close", resolve)
        .on("error", reject);
    });

    // Make avatar circular
    const circleAvatar = await jimp.read(avatarPath);
    circleAvatar.circle();
    await circleAvatar.writeAsync(avatarPath);

    // Load images
    const bg = await loadImage(bgPath);
    const avatar = await loadImage(avatarPath);

    // Create canvas
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Draw circular avatar in center
    const centerX = canvas.width / 2 - 128;
    const centerY = canvas.height / 2 - 128;
    ctx.drawImage(avatar, centerX, centerY, 256, 256);

    // Draw translucent text box
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, canvas.height - 170, canvas.width, 170);

    // Font setup
    registerFont(path.join(__dirname, "fonts", "arialbd.ttf"), { family: "Arial" });
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";

    ctx.font = "bold 45px Arial";
    ctx.fillText(`@${userName}`, canvas.width / 2, canvas.height - 110);

    ctx.font = "30px Arial";
    ctx.fillText(`Welcome to ${groupName} 🎉`, canvas.width / 2, canvas.height - 60);

    ctx.font = "28px Arial";
    ctx.fillText(`You're the ${memberCount}th member 💙`, canvas.width / 2, canvas.height - 20);

    // Save final image
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(finalPath, buffer);

    // Send welcome image
    await api.sendMessage({
      body: `@${userName}`,
      attachment: fs.createReadStream(finalPath),
      mentions: [{
        tag: `@${userName}`,
        id: uid
      }]
    }, event.threadID);

  } catch (err) {
    console.error("❌ Welcome error:", err);
    api.sendMessage("❌ Failed to send welcome image.", event.threadID);
  } finally {
    // Clean up
    [bgPath, avatarPath, finalPath].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
  }

  // Helper: Download image buffer from URL
  async function fetchImage(url) {
    const axios = require("axios");
    const res = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(res.data, "binary");
  }
};
