const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "hd",
  version: "2.2",
  hasPermssion: 0,
  credits: "Islamick Chat",
  description: "Enhance a photo to HD",
  commandCategory: "no prefix",
  usages: "Reply to a photo and type 'hd'",
  cooldowns: 2,
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, messageReply, body } = event;

  if (!body || (body.toLowerCase() !== "hd")) return;
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("আপনি যেই ছবিটিকে HD করতে চান, সেটার উপর reply দিয়ে 'hd' লিখুন।", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("শুধু ছবির উপর reply দিন, অন্য কিছু নয়।", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const pathie = __dirname + `/cache/hd_image.jpg`;

  api.sendMessage("⏳ দয়া করে অপেক্ষা করুন, আপনার ছবি HD করা হচ্ছে...", threadID, async () => {
    try {
      const res = await axios.get(`https://code-merge-api-hazeyy01.replit.app/api/try/remini?url=${encodeURIComponent(imageUrl)}`);
      const hdImageUrl = res.data.image_data;

      const imageData = (await axios.get(hdImageUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathie, Buffer.from(imageData, "binary"));

      api.sendMessage({
        body: "✅ আপনার ছবি HD রূপে প্রস্তুত!",
        attachment: fs.createReadStream(pathie)
      }, threadID, () => fs.unlinkSync(pathie), messageID);
    } catch (err) {
      api.sendMessage("❌ দুঃখিত, কিছু একটা ভুল হয়েছে। পরে আবার চেষ্টা করুন।", threadID, messageID);
    }
  });
};

module.exports.run = async function () {};
