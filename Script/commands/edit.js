module.exports = {
    config: {
        name: "edit",
        version: "1.0",
        hasPermssion: 0,
        credits: "Rx Abdullah",
        description: "Reply message edit kore command diye",
        commandCategory: "system",
        usages: "reply to a message and type !edit <new text>",
        cooldowns: 5
    },

    run: async function({ api, event, args }) {
        if (!event.messageReply) return api.sendMessage("❌ Please reply to a message to edit.", event.threadID);

        const newText = args.join(" ");
        if (!newText) return api.sendMessage("❌ Please provide the new text.", event.threadID);

        const messageID = event.messageReply.messageID;
        const threadID = event.threadID;

        try {
            await api.editMessage(newText, messageID);
        } catch (err) {
            // fallback: unsend + resend
            await api.unsendMessage(messageID);
            const newMsg = await api.sendMessage(newText, threadID);
        }
    }
};
