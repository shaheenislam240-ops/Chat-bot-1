const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

module.exports.config = {
  name: "upload",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "RX Abdullah",
  description: "Upload audio/video to Catbox & save by keyword",
  commandCategory: "media",
  usages: "!upload <keyword> - <title>",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;

  // Check if replied to a video/audio
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("⚠️ দয়া করে একটি ভিডিও বা অডিও ফাইলের রিপ্লাইতে এই কমান্ড দিন।", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  const fileUrl = attachment.url;

  // Parse args
  const input = args.join(" ").split(" - ");
  const keyword = input[0]?.trim()?.toLowerCase();
  const title = input[1]?.trim();

  if (!keyword || !title) {
    return api.sendMessage("❌ সঠিক ফরম্যাট: !upload <keyword> - <title>", threadID, messageID);
  }

  try {
    const tempFile = `temp.${attachment.type === 'audio' ? 'mp3' : 'mp4'}`;
    const data = (await axios.get(fileUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(tempFile, Buffer.from(data, "binary"));

    const form = new FormData();
    form.append("fileToUpload", fs.createReadStream(tempFile));
    form.append("reqtype", "fileupload");

    const res = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(tempFile);

    const uploadedUrl = res.data;
    
    // Save to your API
    await axios.post("https://rx-cloud-api.onrender.com/save", {
      title,
      url: uploadedUrl,
      key: keyword
    });

    return api.sendMessage(`✅ সফলভাবে সংরক্ষণ হয়েছে!\n\n📌 Keyword: ${keyword}\n🎵 Title: ${title}`, threadID, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ ফাইল আপলোডে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", threadID, messageID);
  }
};
