const fs = require("fs");
const axios = require("axios");

module.exports.config = {
  name: "abdullah",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rx Abdullah",
  description: "abdullah keyword এ ভিডিও পাঠাবে",
  commandCategory: "noprefix",
  usages: "abdullah",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event }) => {
  const content = event.body ? event.body.toLowerCase() : "";
  if(content.includes("abdullah")) {
    const videoURL = "https://i.imgur.com/8tJ70qr.mp4";

    const title = `★彡🌙⛧∘₊˚⋆ 𝑨𝑩𝑫𝑼𝑳𝑳𝐀𝐇 𝑴𝑶𝑫𝑬 ∘₊˚⋆⛧🌙彡★

⚡ ᴘᴏᴡᴇʀ ʟᴇᴠᴇʟ: 9999%

｡･ﾟﾟ･　★　･ﾟﾟ･｡
🌟 Sᴜᴘᴇʀ Sᴀɪʏᴀɴ Mᴏᴅᴇ Aᴄᴛɪᴠᴀᴛᴇᴅ 🌟
｡･ﾟﾟ･　★　･ﾟﾟ･｡

༺🌙 𝐑𝐗 𝐀𝐁𝐃𝐔𝐋𝐋𝐀𝐇 𝐁𝐎𝐒𝐒 𝐎𝐅 𝐁𝐎𝐒𝐒𝐄𝐒 🌙༻`;

    // ফেসবুক বট API তে ভিডিও পাঠানোর জন্য direct লিংক অনেক সময় কাজ করে না,
    // তাই ভিডিও ডাউনলোড করে লোকালি ফাইল পাঠানো সবচেয়ে safe

    const pathFile = __dirname + "/cache/abdullah.mp4";

    try {
      // প্রথমে ভিডিও ডাউনলোড করবো যদি না থাকে
      if(!fs.existsSync(pathFile)) {
        const response = await axios({
          method: "GET",
          url: videoURL,
          responseType: "stream"
        });
        await new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(pathFile);
          response.data.pipe(writer);
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      }

      // ভিডিও ও টেক্সট মেসেজ পাঠাও
      api.sendMessage({
        body: title,
        attachment: fs.createReadStream(pathFile)
      }, event.threadID, () => fs.unlinkSync(pathFile), event.messageID);

    } catch (err) {
      console.error(err);
      api.sendMessage("ভিডিও পাঠাতে সমস্যা হয়েছে!", event.threadID);
    }
  }
};

module.exports.run = async () => {};
