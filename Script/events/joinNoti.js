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

  const bgURL = "https://i.postimg.cc/rmkVVbsM/r07qxo-R-Download.jpg";
  const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const bgPath = path.join(cacheDir, "bg.jpg");
  const avatarPath = path.join(cacheDir, `avt_${userID}.png`);
  const outPath = path.join(cacheDir, `welcome_${userID}.png`);

  try {
    const bgImg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgImg));

    const avatarImg = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(avatarPath, Buffer.from(avatarImg));

    const canvas = Canvas.createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatarSize = 180;
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = 100;

    // White circle frame
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2, false);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    const avatar = await Canvas.loadImage(avatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // 🟢 Write Name (big & bold)
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(userName, canvas.width / 2, avatarY + avatarSize + 50);

    // 🟢 Group Name (bold)
    ctx.font = "bold 30px Arial";
    ctx.fillText(groupName, canvas.width / 2, avatarY + avatarSize + 90);

    // 🟢 Member count (bold)
    ctx.font = "bold 28px Arial";
    ctx.fillText(`You are the ${memberCount}th member`, canvas.width / 2, avatarY + avatarSize + 130);

    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(outPath, finalBuffer);

    const message = {
      body: `@${userName} welcome to the group 🎉`,
      mentions: [{ tag: `@${userName}`, id: userID }],
      attachment: fs.createReadStream(outPath)
    };

    api.sendMessage(message, threadID, () => {
      fs.unlinkSync(bgPath);
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(outPath);
    });

  } catch (error) {
    console.error("Joinnoti error:", error);
    api.sendMessage("⚠️ Error while creating welcome image.", threadID);
  }
};
