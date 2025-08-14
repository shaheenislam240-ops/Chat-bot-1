const moment = require("moment-timezone");

module.exports.config = {
    name: "autoreset",
    version: "2.0.0",
    hasPermssion: 2,
    credits: "rX | Modified by Priyansh",
    description: "AUTO RESTART with ON/OFF system",
    commandCategory: "System",
    cooldowns: 5
};

// Default setting (ON)
let isAutoResetOn = true;

module.exports.handleEvent = async function({ api, event, Threads }) {
    if (!isAutoResetOn) return; // Skip if OFF

    var timeNow = moment.tz("Asia/Dhaka").format("HH:mm:ss");
    var seconds = moment.tz("Asia/Dhaka").format("ss");

    // Create restart times for every hour
    let restartTimes = [];
    for (let h = 1; h <= 12; h++) {
        let hour = h.toString().padStart(2, "0");
        restartTimes.push(`${hour}:00:${seconds}`);
    }

    if (restartTimes.includes(timeNow) && seconds < 6) {
        let allThreads = await Threads.getAll(["threadID"]); // All groups
        for (let thread of allThreads) {
            setTimeout(() => {
                api.sendMessage(
                    `⚡️ Now it's: ${timeNow}\nBaby will restart!!!`,
                    thread.threadID,
                    () => process.exit(1)
                );
            }, 1000);
        }
    }
};

module.exports.run = async function({ api, event, args }) {
    if (args[0] === "on") {
        isAutoResetOn = true;
        return api.sendMessage("✅ AutoReset is now ON", event.threadID);
    }
    if (args[0] === "off") {
        isAutoResetOn = false;
        return api.sendMessage("❌ AutoReset is now OFF", event.threadID);
    }
    if (args[0] === "status") {
        return api.sendMessage(
            `📌 AutoReset is currently: ${isAutoResetOn ? "ON ✅" : "OFF ❌"}`,
            event.threadID
        );
    }

    // Default: Show time
    var timeNow = moment.tz("Asia/Dhaka").format("HH:mm:ss");
    api.sendMessage(`🕒 Current Time: ${timeNow}`, event.threadID);
};
