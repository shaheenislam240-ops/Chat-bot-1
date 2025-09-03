module.exports.config = {
    name: "reactunsent",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "rX",
    description: "আপনি reaction দিলে মেসেজ auto unsent হবে",
    commandCategory: "Admin",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    try {
        const { userID, messageID } = event;

        // শুধু আপনার UID
        const myUID = "61579782879961";
        if (userID != myUID) return; // অন্য কেউ reaction দিলে কিছু হবে না

        // মেসেজ unsend করা
        await api.unsendMessage(messageID);

        console.log(`Message ${messageID} unsent by admin ${userID}`);
    } catch (err) {
        console.log(err);
    }
};
