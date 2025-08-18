module.exports.config = {
    name: "unsend2",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Unsend bot messages when reacted",
    commandCategory: "system",
    usages: "",
    cooldowns: 0
};

module.exports.languages = {
    "vi": {
        "returnCant": "Không thể gỡ tin nhắn của người khác.",
        "missingReply": "Hãy reply tin nhắn cần gỡ."
    },
    "en": {
        "returnCant": "Cannot unsend someone else's message.",
        "missingReply": "Reply to the message you want to unsend."
    }
}

module.exports.run = function({ api, event, getText }) {
    // Traditional reply unsend
    if (event.type != "message_reply") return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
    if (event.messageReply.senderID != api.getCurrentUserID()) return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
    return api.unsendMessage(event.messageReply.messageID);
}

module.exports.handleReaction = async function({ api, event }) {
    try {
        // Check if the reacted message is sent by the bot itself
        if (event.userID == api.getCurrentUserID()) return; // Ignore bot's own reaction
        if (!event.messageID) return;

        const botMessageIDs = global.client.handleReaction.filter(msg => msg.messageID == event.messageID);
        if (botMessageIDs.length == 0) return; // Only unsend if it's a tracked bot message

        // Unsend the bot message
        return api.unsendMessage(event.messageID);
    } catch (e) {
        console.log(e);
    }
}
