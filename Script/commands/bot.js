const replies = [
    "Ki bolish bhai, ami to bot e 😎",
    "Bot ekhanei ache, dak diyechish? 🤖",
    "Tmr. Nanir. Uid dew. Castom. Khele. Dekhay. Ki. Ami. Bot. Naki. Pro 🫡",
    "Bujhte parchi tui amakei dakchis 😌"
];

function getRandomReply() {
    const i = Math.floor(Math.random() * replies.length);
    return replies[i];
}

function handleBotCommand(msg) {
    msg = msg.trim().toLowerCase();
    if (msg === 'bot' || msg === 'bot tui') {
        return getRandomReply();
    }
    return null;
}

module.exports = handleBotCommand;
