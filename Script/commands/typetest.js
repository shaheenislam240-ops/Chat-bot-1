"use strict";

// Credits: rX Abdullah
// Description: Typing দেখানোর এবং message পাঠানোর test command

module.exports.config = {
    name: "typetest",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "rX Abdullah",
    description: "Typing দেখানো test command",
    commandCategory: "fun",
    usages: "!typetest",
    cooldowns: 5,
};

module.exports.run = async function({ api, event, ctx }) {
    try {
        // ✅ Typing start
        await ctx.sendTypingIndicatorV2(1, event.threadID);

        // ⏱ 10 সেকেন্ড ধরে typing দেখাও
        await new Promise(resolve => setTimeout(resolve, 10000));

        // ✅ Typing stop
        await ctx.sendTypingIndicatorV2(0, event.threadID);

        // ✅ মেসেজ পাঠাও
        await api.sendMessage("হ্যালো! 10 সেকেন্ড typing দেখালাম 😎", event.threadID);

    } catch (err) {
        console.error("typetest error:", err);
    }
};
