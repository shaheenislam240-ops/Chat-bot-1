const Canvas = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "family",
  version: "3.2.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Create a family photo from group members",
  commandCategory: "group",
  usages: "family all",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  if (args[0] !== "all") {
    return api.sendMessage("📌 Usage: family all", event.threadID, event.messageID);
  }

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs;

    if (!members || members.length === 0) {
      return api.sendMessage("❌ No members found in this group!", event.threadID, event.messageID);
    }

    // STEP 1: Download background
    const bgUrl = "https://i.postimg.cc/zfMsysk9/status-bg.jpg";
    const bgPath = path.join(cacheDir, `family_bg_${event.threadID}.jpg`);

    const bgBuffer = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, bgBuffer);

    // Load background
    const bgImg = await Canvas.loadImage(bgPath);

    const canvas = Canvas.createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Circle crop helper
    async function circleImage(id) {
      try {
        const apiUrl = `https://graph.facebook.com/${id}/picture?width=720&height=720&redirect=false&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(apiUrl);
        const imgUrl = res.data.data.url;

        const imgBuffer = (await axios.get(imgUrl, { responseType: "arraybuffer" })).data;
        const img = await Canvas.loadImage(imgBuffer);

        const size = 200; // base size (adjustable)
        const canvas2 = Canvas.createCanvas(size, size);
        const ctx2 = canvas2.getContext("2d");

        ctx2.beginPath();
        ctx2.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx2.closePath();
        ctx2.clip();
        ctx2.drawImage(img, 0, 0, size, size);

        return canvas2;
      } catch (e) {
        console.error(`❌ Profile pic error for ID ${id}:`, e);
        return null;
      }
    }

    // STEP 2: Arrange members dynamically
    const total = members.length;
    const perRow = Math.ceil(Math.sqrt(total));
    const picSize = Math.min(canvas.width / (perRow + 1), canvas.height / (perRow + 2));

    let x = (canvas.width - (perRow * picSize)) / 2;
    let y = 200; // leave space for title

    for (let i = 0; i < total; i++) {
      const id = members[i];
      const circle = await circleImage(id);
      if (circle) {
        ctx.drawImage(circle, x, y, picSize, picSize);
      }

      x += picSize;
      if ((i + 1) % perRow === 0) {
        x = (canvas.width - (perRow * picSize)) / 2;
        y += picSize;
      }
    }

    // STEP 3: Add title
    ctx.font = "bold 80px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("OUR FAMILY", canvas.width / 2, 100);

    // STEP 4: Save final
    const outPath = path.join(cacheDir, `family_${event.threadID}.png`);
    fs.writeFileSync(outPath, canvas.toBuffer());

    api.sendMessage(
      {
        body: "👨‍👩‍👧‍👦 Our Family Photo ❤️",
        attachment: fs.createReadStream(outPath)
      },
      event.threadID,
      () => fs.unlinkSync(outPath),
      event.messageID
    );

  } catch (e) {
    console.error("❌ Family command error:", e);
    return api.sendMessage("❌ Family command failed! Check console.", event.threadID, event.messageID);
  }
};
