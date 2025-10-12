const fs = require('fs');
const moment = require('moment-timezone');

module.exports.config = {
	name: "filter", // Command name
	version: "1.0",
	hasPermssion: 1, // 0 = everyone, 1 = admin+, 2 = bot owner
	credits: "TruongMini (translated by rX Abdullah)",
	description: "Removes inactive members from the group",
	commandCategory: "utility",
	usages: "filter [number of messages]",
	cooldowns: 5,
};

const monthToMSObj = {
	1: 31 * 24 * 60 * 60 * 1000,
	2: 28 * 24 * 60 * 60 * 1000,
	3: 31 * 24 * 60 * 60 * 1000,
	4: 30 * 24 * 60 * 60 * 1000,
	5: 31 * 24 * 60 * 60 * 1000,
	6: 30 * 24 * 60 * 60 * 1000,
	7: 31 * 24 * 60 * 60 * 1000,
	8: 31 * 24 * 60 * 60 * 1000,
	9: 30 * 24 * 60 * 60 * 1000,
	10: 31 * 24 * 60 * 60 * 1000,
	11: 30 * 24 * 60 * 60 * 1000,
	12: 31 * 24 * 60 * 60 * 1000
};

// Function to convert date/time into milliseconds
const checkTime = (time) => new Promise((resolve) => {
	time.forEach((e, i) => time[i] = parseInt(String(e).trim()));
	const getDayFromMonth = (month) => (month == 0) ? 0 : (month == 2) ? (time[2] % 4 == 0) ? 29 : 28 : ([1, 3, 5, 7, 8, 10, 12].includes(month)) ? 31 : 30;
	let yr = time[2] - 1970;
	let yearToMS = (yr) * 365 * 24 * 60 * 60 * 1000;
	yearToMS += ((yr - 2) / 4).toFixed(0) * 24 * 60 * 60 * 1000;
	let monthToMS = 0;
	for (let i = 1; i < time[1]; i++) monthToMS += monthToMSObj[i];
	if (time[2] % 4 == 0) monthToMS += 24 * 60 * 60 * 1000;
	let dayToMS = time[0] * 24 * 60 * 60 * 1000;
	let hourToMS = time[3] * 60 * 60 * 1000;
	let minuteToMS = time[4] * 60 * 1000;
	let secondToMS = time[5] * 1000;
	let oneDayToMS = 24 * 60 * 60 * 1000;
	let timeMs = yearToMS + monthToMS + dayToMS + hourToMS + minuteToMS + secondToMS - oneDayToMS;
	resolve(timeMs);
});

module.exports.run = async ({ api, event, args, Threads }) => {
	const { threadID } = event;
	const path = __dirname + '/checktt/';
	if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));
	let data = JSON.parse(fs.readFileSync(path));

	let timeVN = moment().tz('Asia/Ho_Chi_Minh').format('DD_MM_YYYY_HH_mm_ss');
	let time = timeVN.split("_");
	let time1 = await checkTime(time);
	let time2 = await new Date(time1);
	let weekday = time2.getDay();

	if (!args[0]) return api.sendMessage("Please enter the minimum message count to keep a member.", threadID);
	if (isNaN(parseInt(args[0]))) return api.sendMessage("You must enter a valid number.", threadID);
	let input = parseInt(args[0]);
	let removed = 0, failed = 0;

	const { adminIDs } = await api.getThreadInfo(threadID);
	if (!(adminIDs.map(e => e.id).some(e => e == api.getCurrentUserID())))
		return api.sendMessage("❌ The bot must be an admin to remove members.", threadID);

	let memberList = [];
	for (let i in data[threadID][weekday].user) {
		memberList.push({ user: i, messages: data[threadID][weekday].user[i].weekday });
	}

	let msg = "";
	for (let i of memberList) {
		try {
			if (i.messages <= input && i.user != api.getCurrentUserID()) {
				await api.removeUserFromGroup(i.user, threadID);
				removed++;
			}
		} catch (e) { failed++; }
	}

	if (removed == 0) return api.sendMessage("No inactive members found to remove.", threadID);
	if (removed != 0) msg += `✅ Removed ${removed} members with less than ${input} messages.\n`;
	if (failed != 0) msg += `⚠️ Failed to remove ${failed} members.`;

	return api.sendMessage(msg, threadID);
};
