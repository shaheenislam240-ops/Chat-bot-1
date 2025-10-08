/* Official owner: rX Abdullah */
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const res = await axios.get("https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json");
  return res.data.api; // key name is "api"
};

module.exports = {
  config: {
    name: "video",
    version: "1.2",
    credits: "rX Abdullah",
    description: "Download video/audio or get info via YouTube API",
    commandCategory: "media",
    hasPermssion: 0,
    usages: "!video [-v|-a|-i] [video link|keyword]"
  },

  run: async ({ api, args, event }) => {
    const { threadID, messageID, senderID } = event;
    let action = args[0]?.toLowerCase() || '-v';

    if (!['-v','video','mp4','-a','audio','mp3','-i','info'].includes(action)) {
      args.unshift('-v'); 
      action = '-v';
    }

    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})(?:\S+)?$/;
    const urlYtb = args[1] ? checkurl.test(args[1]) : false;

    if (urlYtb) {
      const format = ['-v','video','mp4'].includes(action) ? 'mp4' : 'mp3';
      try {
        const videoID = args[1].match(checkurl)[1];
        const pathName = `ytb_${format}_${videoID}.${format}`;
        const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=${format}&quality=3`);

        await api.sendMessage({
          body: `• Title: ${title}\n• Quality: ${quality}`,
          attachment: await downloadFile(downloadLink, pathName)
        }, threadID, () => fs.unlinkSync(pathName), messageID);

        return;
      } catch (e) {
        console.error(e);
        return api.sendMessage("❌ Failed to download video/audio.", threadID, messageID);
      }
    }

    // keyword search
    args.shift();
    const keyWord = args.join(" ");
    if (!keyWord) return api.sendMessage("❌ Please provide a search keyword.", threadID, messageID);

    try {
      const searchResult = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data.slice(0,10);
      if (!searchResult.length) return api.sendMessage(`⭕ No results for: ${keyWord}`, threadID, messageID);

      let msg = "";
      const thumbnails = [];
      let i = 1;

      for (const info of searchResult) {
        thumbnails.push(streamImage(info.thumbnail, `thumb_${i}.jpg`));
        msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
      }

      api.sendMessage({
        body: msg + "👉 Reply with a number to select.",
        attachment: await Promise.all(thumbnails)
      }, threadID, (err, info) => {
        if (err) return console.error(err);
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: senderID,
          result: searchResult,
          action
        });
      }, messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error searching YouTube: " + err.message, threadID, messageID);
    }
  },

  handleReply: async ({ event, api, handleReply }) => {
    const { threadID, messageID, senderID, body } = event;
    if (senderID !== handleReply.author) return;

    const choice = parseInt(body);
    const { result, action } = handleReply;
    if (isNaN(choice) || choice <= 0 || choice > result.length)
      return api.sendMessage("❌ Invalid number.", threadID, messageID);

    const videoID = result[choice-1].id;

    try { await api.unsendMessage(handleReply.messageID); } catch(e){}

    if (['-v','video','mp4','-a','audio','mp3'].includes(action)) {
      const format = ['-v','video','mp4'].includes(action) ? 'mp4' : 'mp3';
      try {
        const pathName = `ytb_${format}_${videoID}.${format}`;
        const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=${format}&quality=3`);

        await api.sendMessage({
          body: `• Title: ${title}\n• Quality: ${quality}`,
          attachment: await downloadFile(downloadLink, pathName)
        }, threadID, () => fs.unlinkSync(pathName), messageID);

      } catch(e) {
        console.error(e);
        return api.sendMessage("❌ Failed to download audio/video.", threadID, messageID);
      }
    }

    if(action === '-i' || action === 'info') {
      try {
        const { data } = await axios.get(`${await baseApiUrl()}/ytfullinfo?videoID=${videoID}`);
        await api.sendMessage({
          body: `✨ Title: ${data.title}\n⏳ Duration: ${(data.duration/60).toFixed(2)} mins\n📺 Resolution: ${data.resolution}\n👀 Views: ${data.view_count}\n👍 Likes: ${data.like_count}\n💬 Comments: ${data.comment_count}\n📂 Category: ${data.categories[0]}\n📢 Channel: ${data.channel}\n🔗 Video URL: ${data.webpage_url}`,
          attachment: await streamImage(data.thumbnail, 'info_thumb.jpg')
        }, threadID, messageID);
      } catch(e){
        console.error(e);
        return api.sendMessage("❌ Failed to fetch video info.", threadID, messageID);
      }
    }
  }
};

async function downloadFile(url, pathName){
  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(pathName, Buffer.from(res.data));
  return fs.createReadStream(pathName);
}

async function streamImage(url, pathName){
  const response = await axios.get(url, { responseType: "stream" });
  response.data.path = pathName;
  return response.data;
}
