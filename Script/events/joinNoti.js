const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "joinnoti",
  version: "1.0.0",
  credits: "Maria (rX Modded)",
  description: "Welcome new member with profile pic and group info",
  eventType: ["log:subscribe"],
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const added = logMessageData.addedParticipants[0];
  if (!added) return;

  const userID = added.userFbId;
  const userName = added.fullName;

  const threadInfo = await api.getThreadInfo(threadID);
  const groupName = threadInfo.threadName;
  const memberCount = threadInfo.participantIDs.length;

  // URLs and paths
  const bgURL = "https://i.postimg.cc/rmkVVbsM/r07qxo-R-Download.jpg";
  const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const bgPath = path.join(cacheDir, "bg.jpg");
  const avatarPath = path.join(cacheDir, `avt_${userID}.png`);
  const outPath = path.join(cacheDir, `welcome_${userID}.png`);

  try {
    // Download background and avatar image
    const bgImg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgImg));

    const avatarImg = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(avatarPath, Buffer.from(avatarImg));

    // Setup canvas
    const canvas = Canvas.createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw circular profile picture in center
    const avatar = await Canvas.loadImage(avatarPath);
    const avatarSize = 180;
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = 100;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Write group name below avatar
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(groupName, canvas.width / 2, avatarY + avatarSize + 50);

    // Write member count below group name
    ctx.font = "20px Arial";
    ctx.fillText(`You are ${memberCount}th member`, canvas.width / 2, avatarY + avatarSize + 90);

    // Save image buffer
    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(outPath, finalBuffer);

    // Send welcome message with mention and attachment
    const message = {
      body: `@${userName} welcome to the group 🎉`,
      mentions: [{ tag: `@${userName}`, id: userID }],
      attachment: fs.createReadStream(outPath)
    };

    api.sendMessage(message, threadID, () => {
      // Clean cache files after sending
      if (fs.existsSync(bgPath)) fs.unlinkSync(bgPath);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    });

  } catch (error) {
    console.error("Joinnoti error:", error);
    api.sendMessage("⚠️ Error while creating welcome image.", threadID);
  }
};
