module.exports.config = {
    name: "unsend",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "rX",
    description: "Bot message reaction দিলে auto unsend করবে",
    commandCategory: "system",
    usages: "reaction unsend",
    cooldowns: 0
};

module.exports.languages = {
    "en": {
        "cantUnsend": "Cannot unsend other user's message.",
        "successUnsend": "Bot message unsent successfully!"
    }
};

module.exports.handleReaction = async function({ api, event, handleReaction, getText }) {
    try {
        // শুধুমাত্র bot-এর message এবং 🧃 emoji এর জন্য
        if (event.userID != handleReaction.author) return; 
        if (event.reaction != "🧃") return;

        const { messageID, threadID } = event;
        await api.unsendMessage(messageID); // message unsent
        return api.sendMessage(getText("successUnsend"), threadID);
    } catch (e) {
        console.log(e);
    }
};
