module.exports.config = {
    name: "lock",
    version: "1.0.5",
    hasPermssion: 2, // bot admin only
    credits: "Modified by rX Abdullah",
    description: "Lock system: locked gc or hard lock (bot admin only)",
    commandCategory: "group",
    usages: "!lock gc | !lock hard",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    // UIDs
    const gcUID = 61581554138544;   // for !lock gc
    const hardUID = 61558559288827; // for !lock hard

    // Define bot admins here
    const botAdmins = ["61579782879961", "61574020165585"]; 

    try {
        // Check if sender is bot admin
        if (!botAdmins.includes(senderID.toString())) {
            return api.sendMessage("⚠️ Only bot admins can use this command!", threadID, messageID);
        }

        // Check command usage
        if (!args[0]) {
            return api.sendMessage("❌ Wrong usage!\nUse:\n!lock gc\n!lock hard", threadID, messageID);
        }

        let targetUID;
        let lockType;

        if (args[0].toLowerCase() === "gc") {
            targetUID = gcUID;
            lockType = "group";
        } else if (args[0].toLowerCase() === "hard") {
            targetUID = hardUID;
            lockType = "hard";
        } else {
            return api.sendMessage("❌ Wrong usage!\nUse:\n!lock gc\n!lock hard", threadID, messageID);
        }

        // Send initial "processing" message
        const msg = await api.sendMessage(`🔒 Locking ${lockType}... please wait`, threadID);

        // Try to add the target user
        await api.addUserToGroup(targetUID, threadID);

        // Edit the previous message to success
        return api.sendMessage(`✅ Done ⚡ ${lockType} locked successfully`, threadID, msg.messageID);
        
    } catch (e) {
        // Edit the previous message to failure
        return api.sendMessage("❌ Can't add user. Maybe bot is not admin or user already in group.", threadID, messageID);
    }
};
