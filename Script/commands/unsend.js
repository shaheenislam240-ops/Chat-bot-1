module.exports.config = {
	name: "unsend",
	eventType: ["message_reply"],
	version: "1.0.1",
	hasPermssion: 0,
	credits: "rX",
	description: "Reply to bot's message to unsend it",
	commandCategory: "system",
	usages: "Just reply to bot's message",
	cooldowns: 0
};

module.exports.languages = {
	"en": {
		"returnCant": "I can only unsend messages sent by me.",
		"missingReply": "Please reply to a message you want me to unsend."
	}
};

module.exports.handleEvent = async function({ api, event, getText }) {
	if (event.type !== "message_reply") return;
	if (event.messageReply.senderID !== api.getCurrentUserID()) return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
	return api.unsendMessage(event.messageReply.messageID);
};
