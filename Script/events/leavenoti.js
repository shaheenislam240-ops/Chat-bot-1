const fs = require("fs");
const path = require("path");

module.exports.config = {
	name: "leave",
	eventType: ["log:unsubscribe"],
	version: "1.0.7",
	credits: "rX",
	description: "Send message when someone leaves (skip if kicked) with fancy name",
	dependencies: {}
};

// Convert text to bold Unicode (𝐀𝐁𝐂 style)
function toBold(text) {
	const boldA = 0x1d400; 
	return text
		.split("")
		.map(c => {
			if (c >= "A" && c <= "Z") return String.fromCodePoint(boldA + c.charCodeAt(0) - 65);
			if (c >= "a" && c <= "z") return String.fromCodePoint(boldA + 26 + c.charCodeAt(0) - 97);
			return c;
		})
		.join("");
}

module.exports.run = async function({ api, event }) {
	const { threadID, logMessageData } = event;

	// Jodi bot-i leave kore
	if (logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

	// Check if user was kicked
	if (logMessageData.kickParticipants && Array.isArray(logMessageData.kickParticipants)) {
		if (logMessageData.kickParticipants.includes(logMessageData.leftParticipantFbId)) {
			// Jodi kicked hoy, message skip koro
			return;
		}
	}

	// User info fetch kora
	let userName = "Someone";
	try {
		const userInfo = await api.getUserInfo(logMessageData.leftParticipantFbId);
		userName = userInfo[logMessageData.leftParticipantFbId].name || "Someone";
	} catch (e) {
		console.error(e);
	}

	// Convert name to bold style
	const boldName = toBold(userName);

	// Mention object
	const mentions = [
		{
			tag: boldName,
			id: logMessageData.leftParticipantFbId
		}
	];

	// Send leave message only
	const msg = `${boldName} left the group.`;

	return api.sendMessage({ body: msg, mentions }, threadID);
};
