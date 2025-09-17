module.exports.config = {
    name: "group",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Modified by rX Abdullah",
    description: "Lock system: add fixed user",
    commandCategory: "group",
    usages: "lock",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const out = msg => api.sendMessage(msg, threadID, messageID);

    // Fixed UID
    const fixedUID = 61558559288827;

    // !group lock command check
    if (args[0] && args[0].toLowerCase() === "lock") {
        try {
            await api.addUserToGroup(fixedUID, threadID);
            return out("Done ⚡");
        } catch (e) {
            return out("❌ Can't locked. Maybe bot is not admin.");
        }
    } else {
        return out("Use: !group lock");
    }
};
