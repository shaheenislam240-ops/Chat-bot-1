const axios = require("axios");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

module.exports.config = {
	name: "info",
	version: "1.0.2", 
	hasPermssion: 0,
	credits: "rX Abdullah",
	description: "Admin and Bot info with video (cached).",
	commandCategory: "...",
	cooldowns: 1
};

module.exports.run = async function({ api, event }) {
	const time = process.uptime(),
		hours = Math.floor(time / (60 * 60)),
		minutes = Math.floor((time % (60 * 60)) / 60),
		seconds = Math.floor(time % 60);

	const currentTime = moment.tz("Asia/Dhaka").format("『D/MM/YYYY』 【HH:mm:ss】");

	const message = 
`𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡
━━━━━━━━━━━━━━━━━━━━━━━
▶ 𝗡𝗮𝗺𝗲: 𝗿𝗫 𝗔𝗯𝗱𝘂𝗹𝗹𝗮𝗵
▶ 𝗔𝗴𝗲: 𝟭𝟴
▶ 𝗣𝗼𝘀𝗶𝘁𝗶𝗼𝗻: 𝗢𝘄𝗻𝗲𝗿
▶ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: https://m.me/rxabdullah007
▶ 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺: @rxabdullah007
▶ 𝗪𝗵𝗮𝘁𝘀𝗮𝗽𝗽: 01317604783
▶ 𝗧𝗶𝗸𝘁𝗼𝗸: @rxteach10
▶ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺: @rxabdullah10
▶ 𝗧𝗶𝗺𝗲: ${currentTime}
▶ 𝗨𝗽𝘁𝗶𝗺𝗲: ${hours}h ${minutes}m ${seconds}s
━━━━━━━━━━━━━━━━━━━━━━━`;

	// Video settings
	const videoUrl = "https://i.imgur.com/JPlo57B.mp4";
	const cacheDir = path.join(__dirname, "cache");
	const cacheFile = path.join(cacheDir, "info_video.mp4");

	try {
		// Make sure cache folder exists
		if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

		// Download video only if not cached
		if (!fs.existsSync(cacheFile)) {
			api.sendMessage("⏳ Downloading video from Imgur, please wait...", event.threadID);

			const response = await axios({
				url: videoUrl,
				method: "GET",
				responseType: "stream"
			});

			const writer = fs.createWriteStream(cacheFile);
			response.data.pipe(writer);

			await new Promise((resolve, reject) => {
				writer.on("finish", resolve);
				writer.on("error", reject);
			});
		}

		// Send cached video
		await api.sendMessage(
			{
				body: message,
				attachment: fs.createReadStream(cacheFile)
			},
			event.threadID
		);

	} catch (error) {
		console.error(error);
		api.sendMessage("❌ Failed to load the video.", event.threadID);
	}
};
