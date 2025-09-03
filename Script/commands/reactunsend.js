module.exports.config = {
    name: "reactunsend",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Rx",
    description: "React dile bot oi message unsend korbe",
    commandCategory: "system",
    usages: "",
    cooldowns: 0
};

module.exports.handleEvent = async ({ event, api }) => {
    try {
        if (!event) return; // kono event na thakle skip
        const { reaction, userID, messageID, threadID } = event;

        // jodi reaction thake
        if (reaction) {
            // bot sudhu nijer message unsend korbe, na hole permission issue hote pare
            const botID = api.getCurrentUserID(); 
            const messageInfo = await api.getMessageInfo(threadID, messageID);
            if (messageInfo.senderID == botID) {
                await api.unsendMessage(messageID);
            }
        }
    } catch (e) {
        console.error("ReactUnsend error:", e);
    }
};
