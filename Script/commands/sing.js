/* Official owner: rX Abdullah */
import axios from "axios";
import fs from "fs";
import path from "path";

const cachePath = path.join(__dirname, "../../cacheSing.json");

// load/save cache
const loadCache = () => {
  if (!fs.existsSync(cachePath)) return {};
  return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
};
const saveCache = (data) => fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));

export const config = {
  name: "sing",
  version: "1.1",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Search YouTube songs and download audio",
  commandCategory: "Music",
  usages: "!sing [song name]",
};

export async function run({ api, event, args }) {
  const songName = args.join(" ");
  if (!songName) return api.sendMessage("❌ Please provide a song name!", event.threadID, event.messageID);

  try {
    // Get base API from GitHub
    const baseRes = await axios.get("https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json");
    const baseApi = baseRes.data.api;

    // Search songs via API
    const res = await axios.get(`${baseApi}/ytFullSearch?songName=${encodeURIComponent(songName)}`);
    const videos = res.data.slice(0, 10);
    if (!videos.length) return api.sendMessage("⚠️ No results found!", event.threadID, event.messageID);

    // Prepare message with thumbnails
    let msg = "🎵 Top 10 results:\n\n";
    for (let i = 0; i < videos.length; i++) {
      msg += `${i + 1}. ${videos[i].title} [${videos[i].time}]\nChannel: ${videos[i].channel.name}\n${videos[i].thumbnail}\n\n`;
    }
    msg += "Reply with the number to download audio.";

    // Save cache
    const cache = loadCache();
    cache[event.senderID] = videos.map(v => v.id);
    saveCache(cache);

    api.sendMessage(msg, event.threadID, event.messageID);

  } catch (err) {
    console.log(err);
    api.sendMessage("❌ Error while accessing API.", event.threadID, event.messageID);
  }
}

export async function handleReply({ api, event }) {
  const num = parseInt(event.body);
  if (!num || num < 1 || num > 10) return api.sendMessage("❌ Invalid number! Choose 1-10.", event.threadID, event.messageID);

  const cache = loadCache();
  const videoId = cache[event.senderID]?.[num - 1];
  if (!videoId) return api.sendMessage("⚠️ Could not find your selection.", event.threadID, event.messageID);

  try {
    // Base API
    const baseRes = await axios.get("https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json");
    const baseApi = baseRes.data.api;

    // Get audio download link
    const audioRes = await axios.get(`${baseApi}/ytDl3?link=${videoId}`);
    const { title, downloadLink } = audioRes.data;

    // Download audio
    const filePath = path.join(__dirname, "../../cache", `${title}.mp3`);
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url: downloadLink, method: "GET", responseType: "stream" });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Send audio to group
    api.sendMessage({
      body: `🎧 ${title}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, event.messageID);

    // Clear cache
    delete cache[event.senderID];
    saveCache(cache);

  } catch (err) {
    console.log(err);
    api.sendMessage("❌ Error while fetching audio.", event.threadID, event.messageID);
  }
}
