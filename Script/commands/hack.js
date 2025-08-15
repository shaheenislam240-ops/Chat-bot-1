module.exports.config = {
  name: "hack",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX",
  description: "hack",
  commandCategory: "hack",
  usages: "@mention",
  dependencies: {
    "axios": "",
    "fs-extra": ""
  },
  cooldowns: 0
};

module.exports.wrapText = (ctx, name, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(name).width < maxWidth) return resolve([name]);
    if (ctx.measureText("W").width > maxWidth) return resolve(null);
    const words = name.split(" ");
    const lines = [];
    let line = "";
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = temp.slice(-1) + words[1];
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(line + words[0]).width < maxWidth) line += words.shift() + " ";
      else {
        lines.push(line.trim());
        line = "";
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
};

module.exports.run = async function ({ args, Users, api, event }) {
  const { loadImage, createCanvas } = require("canvas");
  const fs = require("fs-extra");
  const axios = require("axios");

  let pathImg = __dirname + "/cache/background.png";
  let pathAvt1 = __dirname + "/cache/Avtmot.png";

  var id = Object.keys(event.mentions)[0] || event.senderID;
  var name = await Users.getNameUser(id);

  var background = [
    "https://i.imghippo.com/files/yYX4554yLo.jpeg"
  ];
  var rd = background[Math.floor(Math.random() * background.length)];

  // Get avatar
  let getAvtmot = (
    await axios.get(
      "https://graph.facebook.com/" + id + "/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662",
      { responseType: "arraybuffer" }
    )
  ).data;
  fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot));

  // Get background
  let getbackground = (
    await axios.get(rd, { responseType: "arraybuffer" })
  ).data;
  fs.writeFileSync(pathImg, Buffer.from(getbackground));

  // Load images
  let baseImage = await loadImage(pathImg);
  let baseAvt1 = await loadImage(pathAvt1);

  // Create canvas
  let canvas = createCanvas(baseImage.width, baseImage.height);
  let ctx = canvas.getContext("2d");

  // Draw background
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  // Set text style
  ctx.font = "400 23px Arial";
  ctx.fillStyle = "#1878F3";
  ctx.textAlign = "start";

  // Draw wrapped text
  const lines = await this.wrapText(ctx, name, 1160);
  lines.forEach((line, i) => {
    ctx.fillText(line, 200, 497 + i * 25);
  });

  // Draw avatar
  ctx.drawImage(baseAvt1, 83, 437, 100, 101);

  // Save final image
  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);

  // Remove temp avatar
  fs.removeSync(pathAvt1);

  // Send image
  return api.sendMessage(
    { body: " ", attachment: fs.createReadStream(pathImg) },
    event.threadID,
    () => fs.unlinkSync(pathImg),
    event.messageID
  );
};
