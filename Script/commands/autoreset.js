module.exports.config = {
    name: "autoreset",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "rX (Modified by Priyansh)",
    description: "Auto restart every 3 hours and notify all groups",
    commandCategory: "System",
    cooldowns: 5
};

module.exports.handleEvent = async function({ api }) {
    const moment = require("moment-timezone");
    const timeNow = moment.tz("Asia/Dhaka").format("HH:mm:ss");
    const seconds = parseInt(moment.tz("Asia/Dhaka").format("ss"));
    const hour = parseInt(moment.tz("Asia/Dhaka").format("HH"));

    // প্রতি 3 ঘণ্টা পরপর চেক (0,3,6,9,12,15,18,21)
    if (hour % 3 === 0 && seconds < 6) {
        try {
            const allThreads = global.data.allThreadID || [];
            for (let tid of allThreads) {
                // শুধু গ্রুপে মেসেজ যাবে
                if (!tid.toString().startsWith("0")) {
                    api.sendMessage(`⚡️ Now it's: ${timeNow}\nBaby will restart in a moment!`, tid);
                }
            }

            // 10 সেকেন্ড পরে রিস্টার্ট
            setTimeout(() => process.exit(1), 10000);

        } catch (err) {
            console.error(err);
        }
    }
};

module.exports.run = async ({ api, event }) => {
    const moment = require("moment-timezone");
    const timeNow = moment.tz("Asia/Dhaka").format("HH:mm:ss");
    api.sendMessage(`Current time: ${timeNow}`, event.threadID);
};
