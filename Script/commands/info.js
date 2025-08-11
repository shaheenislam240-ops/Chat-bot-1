module.exports.config = {
	name: "info",
	version: "1.0.1", 
	hasPermssion: 0,
	credits: "Md Abdullah",
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

	api.sendMessage(
`╭─────────────────────╮
   🇧 🇴 🇹  🇦 🇩 🇲 🇮 🇳  🇮 🇳 🇫 🇴 
╰─────────────────────╯

📛 Bot Name: ${global.config.BOTNAME}
👑 Owner: Md Abdullah

📌 Facebook:
╭──────────────╮
https://www.facebook.com/share/1B4V8mMz9i/?mibextid=wwXIfr
╰──────────────╯

💬 Prefix: ${global.config.PREFIX}
📅 Today: ${currentTime}
⏳ Uptime: ${hours}h ${minutes}m ${seconds}s

✅ Thanks for using ${global.config.BOTNAME} 🖤`,
	event.threadID
	);
};
