module.exports = {
    config: {
        name: "editreply",
        version: "1.0",
        hasPermssion: 0,
        credits: "Rx Abdullah",
        description: "Reply er message update kore, safe edit logic use kore.",
        commandCategory: "system",
        usages: "reply to a message and type !editreply [new text]",
        cooldowns: 5
    },

    run: async function({ api, event, args }) {
        // Check if user replied to a message
        if (!event.messageReply) {
            return api.sendMessage("❌ Reply a message first!", event.threadID);
        }

        // Join args to get new text
        const newText = args.join(" ");
        if (!newText) {
            return api.sendMessage("❌ Please provide new text.", event.threadID);
        }

        const threadID = event.threadID;
        let messageID = event.messageReply.messageID;

        // Safe edit function from ager code
        async function safeEdit(api, threadID, messageID, newContent) {
            try {
                await api.editMessage(newContent, messageID);
                return messageID; // return same ID if edit succeeded
            } catch (err) {
                console.log("Edit failed, resending...", err);
                await api.unsendMessage(messageID);
                const newMsg = await api.sendMessage(newContent, threadID);
                return newMsg.messageID; // return new message ID
            }
        }

        // Update the reply message
        messageID = await safeEdit(api, threadID, messageID, newText);

        // Optional: notify user
        await api.sendMessage("✅ Message updated successfully!", threadID);
    }
};
