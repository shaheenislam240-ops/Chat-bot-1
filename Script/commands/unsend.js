module.exports.config = {
	name: "unsend",
	version: "1.0.2",
	hasPermssion: 0,
	credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 + Modified by CYBER",
	description: "Unsend bot messages by reply or angry reaction",
	commandCategory: "system",
	usages: "unsend (reply bot msg) OR react 😡/🤬",
	cooldowns: 0
};

module.exports.languages = {
	"vi": {
		"returnCant": "Không thể gỡ tin nhắn của người khác.",
		"missingReply": "Hãy reply tin nhắn cần gỡ."
	},
	"en": {
		"returnCant": "Kisi Aur Ka Msg M Kese Unsend Karu.",
		"missingReply": "Mere Jis Msg ko Unsend Karna Hai Usme Reply Karke Likkho."
	}
};

module.exports.run = function({ api, event, getText }) {
	if (event.type != "message_reply") 
		return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
	if (event.messageReply.senderID != api.getCurrentUserID()) 
		return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
	
	return api.unsendMessage(event.messageReply.messageID);
};

// --- New feature: unsend if react 😡 or 🤬 ---
module.exports.handleEvent = function({ api, event }) {
	if (event.type === "message_reaction") {
		// only unsend if react 😡 or 🤬 and message belongs to bot
		if ((event.reaction === "😡" || event.reaction === "🤬") && event.senderID !== api.getCurrentUserID()) {
			api.getMessageInfo(event.threadID, event.messageID, (err, info) => {
				if (!err && info.message && info.message.senderID === api.getCurrentUserID()) {
					api.unsendMessage(event.messageID);
				}
			});
		}
	}
};
