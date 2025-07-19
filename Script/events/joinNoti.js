const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");

module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "100.0.0",
  credits: "RX Abdullah",
  description: "Auto welcome image with styled message"
};

module.exports.run = async function({ api, event }) {
  const { threadID } = event;
  const addedUsers = event.logMessageData.addedParticipants;
  if (addedUsers.some(user => user.userFbId === api.getCurrentUserID())) return;

  const threadInfo = await api.getThreadInfo(threadID);
  const memberCount = threadInfo.participantIDs.length;

  for (const user of addedUsers) {
    const userID = user.userFbId;
    const userName = user.fullName;
    const imgPath = path.join(__dirname, "cache", `${userID}_welcome.png`);
    const bgURL = "https://i.postimg.cc/QtnYCz75/IMG-6833.jpg";
    const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;

    try {
      const bgRes = await axios.get(bgURL, { responseType: "arraybuffer" });
      const avatarRes = await axios.get(avatarURL, {
        responseType: "arraybuffer",
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const bgImg = await Canvas.loadImage(Buffer.from(bgRes.data, "binary"));
      const avatarImg = await Canvas.loadImage(Buffer.from(avatarRes.data, "binary"));

      const canvas = Canvas.createCanvas(720, 400);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      const avatarX = 270;
      const avatarY = 70;
      const avatarSize = 180;
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.font = "bold 36px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`𝗪𝗲𝗹𝗰𝗼𝗺𝗲 ${userName}`, 360, 300);

      ctx.font = "bold 24px Arial";
      ctx.fillText(`𝗜𝗗: ${userID}`, 360, 340);
      ctx.fillText(`𝗠𝗲𝗺𝗯𝗲𝗿 𝗡𝗼: ${memberCount}`, 360, 375);

      const buffer = canvas.toBuffer("image/png");
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(imgPath, buffer);

      const mention = [{ tag: userName, id: userID }];
      const message = {
        body: `@${userName} welcome to the group 🎉\nType !help for all commands ⚙️\n𝗬𝗼𝘂 𝗮𝗿𝗲 𝘁𝗵𝗲 ${memberCount}𝘁𝗵 𝗺𝗲𝗺𝗯𝗲𝗿 💙`,
        mentions: mention,
        attachment: fs.createReadStream(imgPath)
      };

      api.sendMessage(message, threadID, () => fs.unlinkSync(imgPath));
    } catch (err) {
      console.log("Welcome Image Error:", err.message);
    }
  }
};
