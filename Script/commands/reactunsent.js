module.exports.config = {
    name: "reactunsent",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Rx",
    description: "Bot এর message এ reaction দিলে unsent করবে",
    commandCategory: "General",
    usages: "reactunsent",
    cooldowns: 5
};

module.exports.languages = {
    "en": {
        "sendMsg": "React 🧃 to unsent this message."
    }
};

module.exports.run = async function ({ api, event }) {
    try {
        // bot message পাঠানো
        const info = await api.sendMessage(module.exports.languages.en.sendMsg, event.threadID);

        // handleReaction এ push করা
        global.client.handleReaction.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID // শুধু যিনি কমান্ড চালালেন তার reaction handle হবে
        });
    } catch (e) {
        console.log("ReactUnsent Command Error:", e);
    }
};

module.exports.handleReaction = async function ({ api, event, handleReaction }) {
    try {
        const { messageID, userID } = event;

        // handleReaction থেকে matching data খুঁজে বের করা
        const index = handleReaction.findIndex(e => e.messageID == messageID);
        if (index < 0) return;

        const reactionData = handleReaction[index];

        // শুধু author এর reaction handle হবে
        if (userID != reactionData.author) return;

        // message unsend করা
        await api.unsendMessage(messageID);

        // handleReaction array থেকে remove করা
        handleReaction.splice(index, 1);

        console.log(`Message ${messageID} unsent by reaction from ${userID}`);

    } catch (e) {
        console.log("ReactUnsent HandleReaction Error:", e);
    }
};
