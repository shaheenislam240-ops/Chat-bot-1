module.exports.config = {
	name: "unsend",
	version: "1.0.4",
	hasPermssion: 0,
	credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 + Modified by rX",
	description: "Auto unsend bot messages by reply or angry react (no prefix needed)",
	commandCategory: "system",
	usages: "Reply bot msg + 😡/🤬 OR just reply then unsend",
	cooldowns: 0
};

module.exports.handleEvent = function({ api, event }) {
	// Case 1: যদি শুধু reply করে unsend করতে চায়
	if (event.type === "message_reply") {
		if (event.messageReply && event.messageReply.senderID === api.getCurrentUserID()) {
			// শুধু reply দিলেই unsend হবে
			api.unsendMessage(event.messageReply.messageID);
		}
	}

	// Case 2: যদি reply এর সাথে 😡 বা 🤬 react দেয়
	if (event.type === "message_reaction") {
		if (event.reaction === "😡" || event.reaction === "🤬") {
			if (event.messageReply && event.messageReply.senderID === api.getCurrentUserID()) {
				api.unsendMessage(event.messageReply.messageID);
			}
		}
	}
};

module.exports.run = function() {};
