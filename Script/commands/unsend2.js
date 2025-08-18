module.exports.config = {
    name: "🐣",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 + Modified by Rx Abdullah",
    description: "Gỡ tin nhắn của bot khi react kora hoy",
    commandCategory: "system",
    usages: "🐣",
    cooldowns: 0
};

module.exports.languages = {
    "vi": {
        "returnCant": "Không thể gỡ tin nhắn của người khác.",
        "missingReply": "Hãy reply tin nhắn cần gỡ."
    },
    "en": {
        "returnCant": "Kisi aur ka msg kaise unsend karu.",
        "missingReply": "Mere jis msg ko unsend karna hai usme reply karke likkho."
    }
}

// Listener function for reactions
module.exports.handleReaction = async function({ api, event }) {
    try {
        // Check if the reaction is on bot's message
        const messageInfo = await api.getMessageInfo(event.threadID, event.messageID);
        if (messageInfo && messageInfo.senderID == api.getCurrentUserID()) {
            // Unsend the message
            return api.unsendMessage(event.messageID);
        }
    } catch (e) {
        console.error(e);
    }
}

// Command to unsend by reply
module.exports.run = function({ api, event, getText }) {
    if (event.type != "message_reply") return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
    if (event.messageReply.senderID != api.getCurrentUserID()) return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);

    return api.unsendMessage(event.messageReply.messageID);
};
