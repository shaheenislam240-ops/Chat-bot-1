module.exports.config = {
    name: "lock",
    version: "1.0.4",
    hasPermssion: 2, // bot admin only
    credits: "Modified by rX Abdullah",
    description: "Lock system: locked gc (bot admin only)",
    commandCategory: "group",
    usages: "!lock gc",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    // Fixed UID to add
    const fixedUID = 61558559288827;

    // Define bot admins here (replace with actual IDs)
    const botAdmins = ["61579782879961", "61574020165585"]; 

    try {
        // Check if sender is bot admin
        if (!botAdmins.includes(senderID.toString())) {
            return api.sendMessage("⚠️ Only bot admins can use this command!", threadID, messageID);
        }

        // Check command usage
        if (!args[0] || args[0].toLowerCase() !== "gc") {
            return api.sendMessage("❌ Wrong usage!\nUse: !lock gc", threadID, messageID);
        }

        // Send initial "processing" message
        const msg = await api.sendMessage("🔒 Locking group... please wait", threadID);

        // Try to add the fixed user
        await api.addUserToGroup(fixedUID, threadID);

        // Edit the previous message to success
        return api.sendMessage("✅ Done ⚡ locked successfully", threadID, msg.messageID);
        
    } catch (e) {
        // Edit the previous message to failure
        return api.sendMessage("❌ Can't add user. Maybe bot is not admin or user already in group.", threadID, messageID);
    }
};
