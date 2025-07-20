module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.5",
    credits: "rX Abdullah",
    description: "Send welcome message with emojis & multiple user support",
    dependencies: {}
};

module.exports.run = async function({ api, event }) {
    const { threadID } = event;

    // If the bot itself is added
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        return api.sendMessage(`✨ 𝐓𝐡𝐚𝐧𝐤𝐬 𝐟𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐦𝐞! 𝐓𝐲𝐩𝐞 !help 𝐭𝐨 𝐬𝐞𝐞 𝐦𝐲 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬. 💖 `, threadID);
    }

    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName || "this group";
    const totalMembers = threadInfo.participantIDs.length;

    const addedById = event.author;
    const addedByName = await api.getUserInfo(addedById).then(info => info[addedById].name);

    const addedUsers = event.logMessageData.addedParticipants.map(user => user.fullName);
    const addedTags = addedUsers.map(name => `👤 ${name}`).join('\n');

    const memberWord = totalMembers > 1 ? "members" : "member";
    const emoji = totalMembers > 50 ? "🔥" : "✨";

    const customMessage = 
`🎉 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗧𝗛𝗘 𝗚𝗥𝗢𝗨𝗣 🎉

${addedTags}

🏡 Group: **${threadName}**  
👥 Total: **${totalMembers} ${memberWord}**  
➕ Added by: **${addedByName}**

💬 Type **!help** to explore bot features  
📌 Stay respectful and enjoy your time here!

– 🤖 rX Chat Bot ${emoji}`;

    return api.sendMessage(customMessage, threadID);
};
