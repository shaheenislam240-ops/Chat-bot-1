module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment");
    const path = require("path");
    const fs = require("fs");

    // Setup config path
    const DATA_DIR = path.join(__dirname, "..", "..", "cache");
    const CONF_PATH = path.join(DATA_DIR, "manu.config.json");

    // Helper function
    function readJSON(p) {
        try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return {}; }
    }

    return function ({ event }) {
        const timeStart = Date.now();
        const time = moment.tz("Asia/Dhaka").format("HH:MM:ss L");
        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;
        let { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox == ![] && senderID == threadID)) return;

        // Setup check
        const conf = readJSON(CONF_PATH);
        const body = event.body || "";
        const isCommand = /^[!/.#]/.test(body) && !/^manu(\s|$)/i.test(body);

        if (!conf.setupDone && isCommand) {
            api.sendMessage(
                "🛠️ Quick Setup complete korun prothome.\n👉 Type `manu` diye menu open korun, option 1 (Setup) select korun.",
                event.threadID
            );
            return; // Command run hobe na
        }

        if (event.type == "change_thread_image") event.logMessageType = "change_thread_image";

        for (const [key, value] of events.entries()) {
            if (value.config.eventType.indexOf(event.logMessageType) !== -1) {
                const eventRun = events.get(key);
                try {
                    const Obj = { api, event, models, Users, Threads, Currencies };
                    eventRun.run(Obj);

                    if (DeveloperMode) {
                        logger(
                            global.getText(
                                'handleEvent',
                                'executeEvent',
                                time,
                                eventRun.config.name,
                                threadID,
                                Date.now() - timeStart
                            ),
                            '[ Event ]'
                        );
                    }
                } catch (error) {
                    logger(global.getText('handleEvent', 'eventError', eventRun.config.name, JSON.stringify(error)), "error");
                }
            }
        }

        return;
    };
};
