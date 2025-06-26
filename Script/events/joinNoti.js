module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.3",
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️",
    description: "Send custom welcome message when a user joins",
    dependencies: {}
};

module.exports.run = async function({ api, event, Threads }) {
    const { threadID } = event;

    // If bot is added
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        return api.sendMessage(`Thanks for adding me! Type !help to see what I can do.`, threadID);
    }

    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName || "this group";

    const addedById = event.author;
    const addedByName = await api.getUserInfo(addedById).then(info => info[addedById].name);

    const addedNames = event.logMessageData.addedParticipants.map(user => user.fullName);
    const addedTags = addedNames.join(', ');
    const totalMembers = threadInfo.participantIDs.length;

    const message = `🥰 𝙰𝚂𝚂𝙰𝙻𝙰𝙼𝚄 𝙰𝙻𝙰𝙸𝙺𝚄𝙼 ${addedTags}, 𝚆𝙴𝙻𝙲𝙾𝙼𝙴 𝚃𝙾 𝙾𝚄𝚁 “${threadName}” 𝙶𝚁𝙾𝚄𝙿! 😊\n\n` +
    `• 𝙸 𝙷𝙾𝙿𝙴 𝚈𝙾𝚄 𝚆𝙸𝙻𝙻 𝙵𝙾𝙻𝙻𝙾𝚆 𝙾𝚄𝚁 𝙶𝚁𝙾𝚄𝙿 𝚁𝚄𝙻𝙴𝚂 📜\n` +
    `• !help 𝙵𝙾𝚁 𝙰𝙻𝙻 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂 🔧\n` +
    `• 𝙱𝙾𝚃 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝙳 𝙱𝚈: rx \n\n` +
    `• 𝚈𝙾𝚄 𝙰𝚁𝙴 𝙽𝙾𝚆 𝚃𝙷𝙴 ${totalMembers}𝚝𝚑 𝙼𝙴𝙼𝙱𝙴𝚁𝚂 𝙸𝙽 𝙾𝚄𝚁 𝙶𝚁𝙾𝚄𝙿 💫\n` +
    `• 𝙰𝙳𝙳𝙴𝙳 𝙱𝚈: ${addedByName} 🙋‍♂️`;

    return api.sendMessage(message, threadID);
};
