const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "keywordAudio",
    version: "1.0.0",
    hasPermssion: 0,
    description: "Send nupure.mp3 when message contains keyword",
};

module.exports.onMessage = async function({ api, event }) {
    const message = event.body.toLowerCase(); // user message
    const keywords = ["mg", "mgi"]; // keywords list

    // Check if message contains any keyword
    const containsKeyword = keywords.some(keyword => message.includes(keyword));

    if (containsKeyword) {
        const filePath = path.join(__dirname, "noprefix", "nupure.mp3"); // path to your mp3
        if (fs.existsSync(filePath)) {
            api.sendMessage(
                { 
                    attachment: fs.createReadStream(filePath) 
                }, 
                event.threadID
            );
        } else {
            api.sendMessage("File not found!", event.threadID);
        }
    }
};
