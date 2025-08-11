const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "song",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "rX + fixed by ChatGPT",
    description: "Download YouTube song from keyword search and link",
    commandCategory: "Media",
    usages: "[songName] [audio|video]",
    cooldowns: 5,
    dependencies: {
      "node-fetch": "",
      "yt-search": "",
    },
  },

  run: async function ({ api, event, args }) {
    let songName, type;

    if (
      args.length > 1 &&
      (args[args.length - 1].toLowerCase() === "audio" || args[args.length - 1].toLowerCase() === "video")
    ) {
      type = args.pop().toLowerCase();
      songName = args.join(" ");
    } else {
      songName = args.join(" ");
      type = "audio";
    }

    if (!songName) {
      return api.sendMessage("❌ Please provide a song name.", event.threadID, event.messageID);
    }

    const processingMessage = await api.sendMessage(
      "🔍  Searching...",
      event.threadID,
      null,
      event.messageID
    );

    try {
      // Search for the song on YouTube
      let searchResults = await ytSearch(songName);

      // If no results found, try partial match with lowercase
      if (!searchResults || !searchResults.videos.length) {
        searchResults = await ytSearch({ query: songName.toLowerCase(), pages: 1 });
      }

      if (!searchResults || !searchResults.videos.length) {
        throw new Error("No results found for your search query.");
      }

      // Get the top result from the search
      const topResult = searchResults.videos[0];
      const videoId = topResult.videoId;

      const apiKey = "priyansh-here";
      const apiUrl = `https://priyanshuapi.xyz/youtube?id=${videoId}&type=video&apikey=${apiKey}`;

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const downloadResponse = await axios.get(apiUrl);
      const downloadUrl = downloadResponse.data.downloadUrl;

      if (!downloadUrl) throw new Error("Download link not found from API.");

      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://cnvmp3.com/',
      };

      const response = await fetch(downloadUrl, { headers });
      if (!response.ok) {
        throw new Error(`Failed to fetch song. Status code: ${response.status}`);
      }

      const filename = `${topResult.title}.${type === "audio" ? "mp3" : "mp4"}`;
      const downloadPath = path.join(__dirname, filename);

      const songBuffer = await response.buffer();
      fs.writeFileSync(downloadPath, songBuffer);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🖤 Title: ${topResult.title}\n🔗 YouTube: ${topResult.url}\n\nHere is your ${type}:`,
        },
        event.threadID,
        () => {
          fs.unlinkSync(downloadPath);
          api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Failed to download and send song: ${error.message}`);
      api.sendMessage(
        `❌ Failed to download song: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
