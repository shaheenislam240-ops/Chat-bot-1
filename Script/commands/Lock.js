module.exports.config = {
    name: "lock",
    version: "1.0.1",
    hasPermssion: 1, // admin only
    credits: "Modified by rX Abdullah",
    description: "Lock system: add fixed user (admin only)",
    commandCategory: "group",
    usages: "group",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const out = msg => api.sendMessage(msg, threadID, messageID);

    // Fixed UID
    const fixedUID = 61558559288827;

    // Get group info
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(e => e.id);

    // Check if sender is admin
    if (!adminIDs.includes(senderID)) {
        return out("⚠️ Only group admins can use this command!");
    }

    // !group lock command check
    if (args[0] && args[0].toLowerCase() === "lock") {
        try {
            await api.addUserToGroup(fixedUID, threadID);
            return out("✅ Done ⚡ Fixed user added.");
        } catch (e) {
            return out("❌ Can't locked. Maybe bot is not admin.");
        }
    } else {
        return out("Use: !lock group");
    }
};
