module.exports.config = {
    name: "lock",
    version: "1.0.2",
    hasPermssion: 2, // admin only
    credits: "Modified by rX Abdullah",
    description: "Lock system: add fixed user (admin only)",
    commandCategory: "group",
    usages: "!lock gc",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const out = msg => api.sendMessage(msg, threadID, messageID);

    // Fixed UID
    const fixedUID = 61558559288827;

    try {
        // Get group info
        const threadInfo = await api.getThreadInfo(threadID);
        const adminIDs = threadInfo.adminIDs.map(e => e.id);

        // Check if sender is admin
        if (!adminIDs.includes(senderID)) {
            return out("⚠️ Only group admins can use this command!");
        }

        // !lock gc command check
        if (args[0] && args[0].toLowerCase() === "gc") {
            await api.addUserToGroup(fixedUID, threadID);
            return out("✅ Done ⚡ locked successfully");
        } else {
            return out("❌ Wrong usage!\nUse: !lock gc");
        }
    } catch (e) {
        return out("❌ Can't add user. Maybe bot is not admin or user already in group.");
    }
};
