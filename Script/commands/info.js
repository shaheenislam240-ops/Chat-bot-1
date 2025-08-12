module.exports.config = {
	name: "info",
	version: "1.0.1", 
	hasPermssion: 0,
	credits: "rX Abdullah",
	description: "Admin and Bot info.",
	commandCategory: "...",
	cooldowns: 1
};

module.exports.run = async function({ api, event }) {
	const moment = require("moment-timezone");

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

	api.sendMessage(message, event.threadID);
};
