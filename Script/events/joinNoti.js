const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const Canvas = require('canvas');

module.exports.config = {
  name: "join",
  eventType: ["log:subscribe"],
  version: "1.1.0",
  credits: "RX Abdullah (Text box update)",
  description: "Welcome system with styled text box",
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const threadInfo = await api.getThreadInfo(threadID);
  const newMember = event.logMessageData.addedParticipants[0];
  const uid = newMember.userFbId;
  const userName = newMember.fullName;
  const memberCount = threadInfo.participantIDs.length;
  const groupName = threadInfo.threadName;

  const pathImg = path.join(__dirname, "cache", `${uid}_avatar.png`);
  const bgURL = "https://i.postimg.cc/QtnYCz75/IMG-6833.jpg";
  const fallback = "https://i.postimg.cc/QtnYCz75/IMG-6833.jpg";

  // Get avatar
  try {
    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
    const imgData = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(imgData, "utf-8"));
  } catch {
    const imgData = (await axios.get(fallback, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(imgData, "utf-8"));
  }

  // Canvas setup
  const canvas = Canvas.createCanvas(800, 400);
  const ctx = canvas.getContext("2d");
  const background = await Canvas.loadImage(bgURL);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Draw circular avatar
  const avatar = await Canvas.loadImage(pathImg);
  ctx.save();
  ctx.beginPath();
  ctx.arc(400, 150, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 300, 50, 200, 200);
  ctx.restore();

  // Draw semi-transparent black box
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(150, 270, 500, 100);

  // Text on box
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  ctx.font = "bold 30px Arial";
  ctx.fillText(`${userName}`, 400, 300);

  ctx.font = "bold 24px Arial";
  ctx.fillText(`Welcome to ${groupName}`, 400, 335);

  ctx.font = "20px Arial";
  ctx.fillText(`You're member #${memberCount}`, 400, 365);

  // Final image save
  const finalPath = path.join(__dirname, "cache", `${uid}_welcome.png`);
  fs.writeFileSync(finalPath, canvas.toBuffer("image/png"));

  // Send to group
  api.sendMessage({
    body: `@${userName} added 🎉`,
    mentions: [{ tag: userName, id: uid }],
    attachment: fs.createReadStream(finalPath)
  }, threadID, () => {
    fs.unlinkSync(pathImg);
    fs.unlinkSync(finalPath);
  });
};
