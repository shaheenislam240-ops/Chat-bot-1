module.exports.config = {
    name: "reactUnsend",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "rX",
    description: "Unsend bot message on 🧃 reaction",
    commandCategory: "system",
    cooldowns: 0
};

module.exports.handleReaction = async function({ api, event }) {
    try {
        const { messageID, reaction, senderID } = event;

        // শুধুমাত্র 🧃 reaction handle হবে
        if (reaction !== "🧃") return;

        // যদি message bot এর হয়
        if (!global.client.handleReaction.some(e => e.messageID == messageID)) return;

        // unsend করো
        await api.unsendMessage(messageID).catch(err => console.log(err));

        // handleReaction থেকে remove
        const index = global.client.handleReaction.findIndex(e => e.messageID == messageID);
        if (index >= 0) global.client.handleReaction.splice(index, 1);

        console.log(`Message ${messageID} unsent due to 🧃 reaction by ${senderID}`);
    } catch (err) {
        console.log("React Unsend Error:", err);
    }
};
