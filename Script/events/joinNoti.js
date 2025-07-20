module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.3",
    credits: "rX Abdullah",
    description: "Send custom welcome message when a user joins",
    dependencies: {}
};

module.exports.run = async function({ api, event }) {
    const { threadID } = event;

    // If bot is added to the group
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        return api.sendMessage(`✨ 𝐓𝐡𝐚𝐧𝐤𝐬 𝐟𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐦𝐞! 𝐓𝐲𝐩𝐞 !help 𝐭𝐨 𝐬𝐞𝐞 𝐦𝐲 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬. 💖`, threadID);
    }

    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName || "this group";

    const addedById = event.author;
    const addedByName = await api.getUserInfo(addedById).then(info => info[addedById].name);

    const addedNames = event.logMessageData.addedParticipants.map(user => user.fullName);
    const addedTags = addedNames.join(', ');
    const totalMembers = threadInfo.participantIDs.length;

    const customMessage = 
`╭━━━⊱🌺 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 🌺⊰━━━╮

✨ 𝓐𝓼𝓼𝓪𝓵𝓪𝓶𝓾 𝓐𝓵𝓪𝓲𝓴𝓾𝓶, 『 ${addedTags} 』❤️  
🎉 𝓨𝓸𝓾 𝓱𝓪𝓿𝓮 𝓳𝓸𝓲𝓷𝓮𝓭 𝓽𝓱𝓮 𝓯𝓪𝓶𝓲𝓵𝔂 — 𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓽𝓸 『 ${threadName} 』🎊
👑 𝓨𝓸𝓾 𝓪𝓻𝓮 𝓷𝓸𝔀 𝓽𝓱𝓮 ${totalMembers}𝓽𝓱 𝓶𝓮𝓶𝓫𝓮𝓻 𝓸𝓯 𝓸𝓾𝓻 𝓯𝓪𝓶! 💞
🙋‍♂️ 𝓐𝓭𝓭𝓮𝓭 𝓑𝔂: ${addedByName}

╰━━━━━━⊱💖⊰━━━━━━╯`;

    return api.sendMessage(customMessage, threadID);
};
