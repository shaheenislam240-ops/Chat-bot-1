const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const { loadImage, createCanvas, registerFont } = require('canvas');
const jimp = require("jimp");

module.exports.config = {
  name: "join",
  eventType: ["log:subscribe"],
  version: "1.0.0",
  credits: "RX Abdullah",
  description: "Welcome image with circular profile photo and styled text"
};

module.exports.run = async function({ api, event }) {
  const addedUser = event.logMessageData.addedParticipants[0];
  const uid = addedUser.userFbId;
  const userName = addedUser.fullName;
  const threadInfo = await api.getThreadInfo(event.threadID);
  const memberCount = threadInfo.participantIDs.length;
  const groupName = threadInfo.threadName || "this group";

  const basePath = __dirname + "/cache";
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

  const bgUrl = "https://i.postimg.cc/QtnYCz75/IMG-6833.jpg";
  const bgPath = `${basePath}/bg.jpg`;
  const avatarPath = `${basePath}/avt.png`;
  const finalPath = `${basePath}/welcome_${uid}.png`;

  try {
    // Download background
    const bgImg = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgImg, "utf-8"));

    // Download profile photo
    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
    const avatarImg = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(avatarPath, Buffer.from(avatarImg, "utf-8"));

    // Make circular avatar
    const circleAvatar = await jimp.read(avatarPath);
    circleAvatar.circle();
    await circleAvatar.writeAsync(avatarPath);

    // Load images
    const bg = await loadImage(bgPath);
    const avatar = await loadImage(avatarPath);

    // Canvas setup
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Draw circular profile
    const centerX = canvas.width / 2 - 128;
    const centerY = canvas.height / 2 - 128;
    ctx.drawImage(avatar, centerX, centerY, 256, 256);

    // Draw translucent black box
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, canvas.height - 170, canvas.width, 170);

    // Fonts
    registerFont(__dirname + "/fonts/arialbd.ttf", { family: "Arial" }); // Add your font file
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";

    ctx.font = "bold 45px Arial";
    ctx.fillText(`@${userName}`, canvas.width / 2, canvas.height - 110);

    ctx.font = "30px Arial";
    ctx.fillText(`Welcome to ${groupName} 🎉`, canvas.width / 2, canvas.height - 60);

    ctx.font = "28px Arial";
    ctx.fillText(`You're the ${memberCount}th member 💙`, canvas.width / 2, canvas.height - 20);

    // Save final
    const buffer = canvas.toBuffer();
    fs.writeFileSync(finalPath, buffer);

    // Send image
    await api.sendMessage({
      body: ``,
      attachment: fs.createReadStream(finalPath)
    }, event.threadID);

    // Clean up
    fs.unlinkSync(bgPath);
    fs.unlinkSync(avatarPath);
    fs.unlinkSync(finalPath);
  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Failed to send welcome image.", event.threadID);
  }
};
