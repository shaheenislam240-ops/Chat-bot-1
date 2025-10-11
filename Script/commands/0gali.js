const fs = require("fs");
module.exports.config = {
	name: "gali",
    version: "1.0.4",
	hasPermssion: 2,
	credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
	description: "Don't Change Credits",
	commandCategory: "no prefix",
	usages: "mgi|suar",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
	var { threadID, messageID, body } = event;

	// Original gali keywords
	const galiKeywords = ["Mgi","Khanki","Mg","Magi"];

	// Suar keywords (both trigger same audio)
	const suarKeywords = ["Suar", "Suar er bacca"];

	// Check for gali keywords
	if (galiKeywords.some(keyword => body.indexOf(keyword) == 0)) {
		var msg = {
			body: "aisob kintu vlo lge na",
			attachment: fs.createReadStream(__dirname + `/noprefix/nupure.mp3`)
		}
		api.sendMessage(msg, threadID, messageID);
		api.setMessageReaction("😡", messageID, (err) => {}, true);
	}

	// Check for suar keywords
	if (suarKeywords.some(keyword => body.indexOf(keyword) == 0)) {
		var msg = {
			body: "Suar kotha bolle bhalo lage na",
			attachment: fs.createReadStream(__dirname + `/noprefix/suar.mp3`)
		}
		api.sendMessage(msg, threadID, messageID);
		api.setMessageReaction("😡", messageID, (err) => {}, true);
	}
}

module.exports.run = function({ api, event, client, __GLOBAL }) {
  // Empty run function
	}
