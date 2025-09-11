const Canvas = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "family",
  version: "2.0.0",
  role: 0,
  author: "Rx Abdullah",
  cooldowns: 5,
  hasPermssion: 0,
  description: "Make a family photo of group members",
  commandCategory: "group",
  usages: "[all]"
};

module.exports.run = async function({ api, event, args }) {
  if (args[0] !== "all") return api.sendMessage("Use: !family all", event.threadID, event.messageID);

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs;

    if (!members || members.length === 0) {
      return api.sendMessage("❌ Error: No members found!", event.threadID, event.messageID);
    }

    // STEP 1: Download background from imgur (cache)
    const bgUrl = "https://i.imgur.com/dlO4WQn.jpeg";
    const bgPath = path.join(cacheDir, `family_bg_${event.threadID}.jpg`);

    try {
      const bgBuffer = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(bgPath, bgBuffer);
    } catch (e) {
      console.error("Background download error:", e);
      return api.sendMessage("❌ Error: Failed to download background from imgur!", event.threadID, event.messageID);
    }

    // Load background
    let bgImg;
    try {
      bgImg = await Canvas.loadImage(bgPath);
    } catch (e) {
      console.error("Background load error:", e);
      return api.sendMessage("❌ Error: Failed to load background image!", event.threadID, event.messageID);
    }

    const canvas = Canvas.createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Circle crop function
    async function circleImage(id) {
      try {
        // Get direct profile image URL
        const apiUrl = `https://graph.facebook.com/${id}/picture?width=720&height=720&redirect=false&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(apiUrl);
        const imgUrl = res.data.data.url;

        const imgBuffer = (await axios.get(imgUrl, { responseType: "arraybuffer" })).data;
        const img = await Canvas.loadImage(imgBuffer);

        const size = 150;
        const canvas2 = Canvas.createCanvas(size, size);
        const ctx2 = canvas2.getContext("2d");

        ctx2.beginPath();
        ctx2.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx2.closePath();
        ctx2.clip();
        ctx2.drawImage(img, 0, 0, size, size);

        return canvas2;
      } catch (e) {
        console.error(`Profile pic error for ID ${id}:`, e);
        return null;
      }
    }

    // STEP 2: Arrange member pics
    const perRow = Math.ceil(Math.sqrt(members.length));
    const picSize = Math.min(canvas.width / perRow, canvas.height / perRow);

    let x = 0, y = 200; // start 200px down to keep title space

    for (const id of members) {
      const circle = await circleImage(id);
      if (circle) {
        ctx.drawImage(circle, x, y, picSize, picSize);
      } else {
        console.log(`⚠️ Skipped member ${id}`);
      }
      x += picSize;
      if (x + picSize > canvas.width) {
        x = 0;
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
      { body: "👨‍👩‍👧‍👦 Our Family Photo ❤️", attachment: fs.createReadStream(outPath) },
      event.threadID,
      () => fs.unlinkSync(outPath),
      event.messageID
    );
  } catch (e) {
    console.error("Family command error:", e);
    return api.sendMessage("❌ Error: Family command failed, check console!", event.threadID, event.messageID);
  }
};
