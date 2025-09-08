module.exports.config = {
    name: "admin",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "rX Abdullah",
    description: "Manage Admin & Support roles",
    commandCategory: "system",
    usages: "admin [list/add/remove/addndh/removendh]",
    cooldowns: 5,
};

module.exports.run = async function({ api, event, args, Users, config }) {
    const { threadID, messageID } = event;
    let ADMINBOT = config.ADMINBOT || [];
    let NDH = config.NDH || [];

    // Helper: সুন্দর Frame বানানোর ফাংশন
    function makeFrame(title, content) {
        return `╭───× ${title} ×───╮\n${content}\n╰─────────────⧕`;
    }

    switch (args[0]) {
        case "list":
        case "all": {
            let msgAdmin = "";
            let msgNDH = "";

            let i = 1;
            for (const idAdmin of ADMINBOT) {
                if (parseInt(idAdmin)) {
                    const name = (await Users.getData(idAdmin)).name || "Unknown";
                    msgAdmin += `│  ${i++}. ${name}\n│     🆔 ${idAdmin}\n`;
                }
            }

            let j = 1;
            for (const idNDH of NDH) {
                if (parseInt(idNDH)) {
                    const name1 = (await Users.getData(idNDH)).name || "Unknown";
                    msgNDH += `│  ${j++}. ${name1}\n│     🆔 ${idNDH}\n`;
                }
            }

            let finalMsg =
`${makeFrame("𝗔𝗗𝗠𝗜𝗡 𝗟𝗜𝗦𝗧", msgAdmin || "│  ❌ No Admin Found")}

${makeFrame("𝗦𝗨𝗣𝗣𝗢𝗥𝗧 𝗟𝗜𝗦𝗧", msgNDH || "│  ❌ No Support Found")}`;

            return api.sendMessage(finalMsg, threadID, messageID);
        }

        case "add": {
            let uid = Object.keys(event.mentions)[0];
            if (!uid) return api.sendMessage("⚠️ Mention someone!", threadID, messageID);
            if (ADMINBOT.includes(uid)) return api.sendMessage("⚠️ Already an Admin!", threadID, messageID);

            ADMINBOT.push(uid);
            let name = event.mentions[uid];
            return api.sendMessage(
                makeFrame("✅ ADMIN ADDED", `│  ${name}\n│     🆔 ${uid}`),
                threadID, messageID
            );
        }

        case "remove": {
            let uid = Object.keys(event.mentions)[0];
            if (!uid) return api.sendMessage("⚠️ Mention someone!", threadID, messageID);
            if (!ADMINBOT.includes(uid)) return api.sendMessage("⚠️ Not an Admin!", threadID, messageID);

            ADMINBOT = ADMINBOT.filter(e => e !== uid);
            let name = event.mentions[uid];
            return api.sendMessage(
                makeFrame("❌ ADMIN REMOVED", `│  ${name}\n│     🆔 ${uid}`),
                threadID, messageID
            );
        }

        case "addndh": {
            let uid = Object.keys(event.mentions)[0];
            if (!uid) return api.sendMessage("⚠️ Mention someone!", threadID, messageID);
            if (NDH.includes(uid)) return api.sendMessage("⚠️ Already Support!", threadID, messageID);

            NDH.push(uid);
            let name = event.mentions[uid];
            return api.sendMessage(
                makeFrame("✅ SUPPORT ADDED", `│  ${name}\n│     🆔 ${uid}`),
                threadID, messageID
            );
        }

        case "removendh": {
            let uid = Object.keys(event.mentions)[0];
            if (!uid) return api.sendMessage("⚠️ Mention someone!", threadID, messageID);
            if (!NDH.includes(uid)) return api.sendMessage("⚠️ Not Support!", threadID, messageID);

            NDH = NDH.filter(e => e !== uid);
            let name = event.mentions[uid];
            return api.sendMessage(
                makeFrame("❌ SUPPORT REMOVED", `│  ${name}\n│     🆔 ${uid}`),
                threadID, messageID
            );
        }

        default: {
            return api.sendMessage(
`╭───× 𝗔𝗗𝗠𝗜𝗡 𝗖𝗠𝗗𝗦 ×───╮
│  list → View Admin & Support list
│  add → Add Admin (mention)
│  remove → Remove Admin (mention)
│  addndh → Add Support (mention)
│  removendh → Remove Support (mention)
╰─────────────⧕`,
            threadID, messageID);
        }
    }
};
