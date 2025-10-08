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
  version: "1.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Search and download YouTube audio via API",
  commandCategory: "Music",
  usages: "!sing [song name]",
};

export async function run({ api, event, args }) {
  const songName = args.join(" ");
  if (!songName) return api.sendMessage("❌ Please provide a song name!", event.threadID, event.messageID);

  try {
    // 1️⃣ Get API base URL from GitHub
    const baseRes = await axios.get("https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json");
    const baseApi = baseRes.data.api; // key name "api"

    // 2️⃣ Search YouTube via API
    const res = await axios.get(`${baseApi}/ytFullSearch?songName=${encodeURIComponent(songName)}`);
    const videos = res.data.slice(0, 10);
    if (!videos.length) return api.sendMessage("⚠️ No results found!", event.threadID, event.messageID);

    // 3️⃣ Prepare message
    let msg = "🎵 Top 10 results:\n\n";
    videos.forEach((v, i) => {
      msg += `${i + 1}. ${v.title} [${v.time}]\nChannel: ${v.channel.name}\n\n`;
    });
    msg += "Reply with the number to download audio.";

    // 4️⃣ Save cache
    const cache = loadCache();
    cache[event.senderID] = videos.map(v => v.id);
    saveCache(cache);

    // 5️⃣ Send message
    api.sendMessage(msg, event.threadID, event.messageID);

  } catch (err) {
    console.log(err);
    api.sendMessage("❌ Error while accessing API.", event.threadID, event.messageID);
  }
}

// 6️⃣ Handle reply to download audio
export async function handleReply({ api, event }) {
  const num = parseInt(event.body);
  if (!num || num < 1 || num > 10) return api.sendMessage("❌ Invalid number! Choose 1-10.", event.threadID, event.messageID);

  const cache = loadCache();
  const videoId = cache[event.senderID]?.[num - 1];
  if (!videoId) return api.sendMessage("⚠️ Could not find your selection.", event.threadID, event.messageID);

  try {
    // Get base API again
    const baseRes = await axios.get("https://raw.githubusercontent.com/rummmmna21/rx-api/refs/heads/main/baseApiUrl.json");
    const baseApi = baseRes.data.api;

    // Get audio download link from API
    const audioRes = await axios.get(`${baseApi}/ytDl3?link=${videoId}`);
    const { title, downloadLink } = audioRes.data;

    // Send audio as attachment
    api.sendMessage({
      body: `🎧 ${title}`,
      attachment: fs.createReadStream(await downloadAudio(downloadLink, title))
    }, event.threadID, event.messageID);

    // clear cache
    delete cache[event.senderID];
    saveCache(cache);

  } catch (err) {
    console.log(err);
    api.sendMessage("❌ Error while fetching audio.", event.threadID, event.messageID);
  }
}

// helper function to download audio locally
async function downloadAudio(url, title) {
  const filePath = path.join(__dirname, "../../cache", `${title}.mp3`);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
}
