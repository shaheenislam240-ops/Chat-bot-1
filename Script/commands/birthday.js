module.exports.config = {
  name: "birthday",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Modified by ChatGPT for rX Abdullah",
  description: "Shows rX Abdullah's birthday countdown or wishes",
  usePrefix: true,
  commandCategory: "info",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const fs = global.nodemodule["fs-extra"];
  const request = global.nodemodule["request"];

  const now = new Date();
  let targetYear = now.getFullYear();
  const birthMonth = 8; // September (index starts from 0)
  const birthDate = 26;
  const birthday = new Date(targetYear, birthMonth, birthDate, 0, 0, 0);

  if (now > birthday) targetYear++;

  const target = new Date(targetYear, birthMonth, birthDate, 0, 0, 0);
  const t = target - now;

  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.floor((t / 1000 / 60) % 60);
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));

  if (days === 0 && hours === 0 && minutes === 0 && seconds <= 59) {
    const callback = () => api.sendMessage({
      body: `🎉 আজ rX Abdullah এর জন্মদিন!\nসবাই উইশ করো 🥳💙\n📅 26 সেপ্টেম্বর, 2007 🎂`,
      attachment: fs.createReadStream(__dirname + "/cache/birthday.png")
    }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/birthday.png"), event.messageID);

    return request(encodeURI(`https://graph.facebook.com/100068565380737/picture?height=720&width=720`))
      .pipe(fs.createWriteStream(__dirname + "/cache/birthday.png"))
      .on("close", () => callback());
  }

  const msg = `📅 rX Abdullah এর জন্মদিন আসতে বাকি:\n\n⏳ ${days} দিন\n🕒 ${hours} ঘণ্টা\n🕑 ${minutes} মিনিট\n⏱️ ${seconds} সেকেন্ড`;
  const callback = () => api.sendMessage({
    body: msg,
    attachment: fs.createReadStream(__dirname + "/cache/birthday.png")
  }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/birthday.png"), event.messageID);

  return request(encodeURI(`https://graph.facebook.com/100068565380737/picture?height=720&width=720`))
    .pipe(fs.createWriteStream(__dirname + "/cache/birthday.png"))
    .on("close", () => callback());
};
