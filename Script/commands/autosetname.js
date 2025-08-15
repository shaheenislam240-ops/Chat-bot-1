module.exports.config = {
    name: "autosetname",
    version: "1.0.2",
    hasPermssion: 1,
    credits: "rX",
    description: "Automatic setname for new members",
    commandCategory: "Box Chat",
    usages: "[add <name> /remove]",
    cooldowns: 5
}

module.exports.onLoad = () => {
    const { existsSync, writeFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const pathData = join(__dirname, "cache", "autosetname.json");
    if (!existsSync(pathData)) writeFileSync(pathData, "[]", "utf-8"); 
}

module.exports.run = async function({ event, api, args, Users }) {
    const { threadID, messageID, senderID } = event;
    const { readFileSync, writeFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const pathData = join(__dirname, "cache", "autosetname.json");

    let dataJson = JSON.parse(readFileSync(pathData, "utf-8"));
    let thisThread = dataJson.find(item => item.threadID == threadID) || { threadID, nameUser: [] };
    const content = args.slice(1).join(" ");

    switch(args[0]) {
        case "add": {
            if (!content) return api.sendMessage("The configuration of the new member's name must not be empty!", threadID, messageID);
            if (thisThread.nameUser.length > 0) return api.sendMessage("Please remove the old name configuration before setting a new one!", threadID, messageID);
            thisThread.nameUser.push(content);
            const name = (await Users.getData(senderID)).name;
            if (!dataJson.some(item => item.threadID == threadID)) dataJson.push(thisThread);
            writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
            api.sendMessage(`Configured a new member name successfully!\nPreview: ${content} ${name}`, threadID, messageID);
            break;
        }
        case "rm":
        case "remove":
        case "delete": {
            if (thisThread.nameUser.length == 0) return api.sendMessage("Your group hasn't configured a new member's name!", threadID, messageID);
            thisThread.nameUser = [];
            writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
            api.sendMessage("Successfully deleted the configuration of a new member's name.", threadID, messageID);
            break;
        }
        default: {
            api.sendMessage("Use:\nautosetname add <name> → to configure a nickname for new members\nautosetname remove → to remove the nickname configuration", threadID, messageID);
        }
    }
}

// ===== Handle new member event =====
module.exports.handleEvent = async function({ event, api, Users }) {
    const { threadID, logMessageType, logMessageData } = event;
    if (logMessageType != "log:subscribe") return;

    const { readFileSync, writeFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const pathData = join(__dirname, "cache", "autosetname.json");
    let dataJson = JSON.parse(readFileSync(pathData, "utf-8"));
    let thisThread = dataJson.find(item => item.threadID == threadID);
    if (!thisThread || thisThread.nameUser.length == 0) return;

    const addedParticipants = logMessageData.addedParticipants;
    for (const user of addedParticipants) {
        const userName = (await Users.getData(user.userID)).name;
        const newName = `${thisThread.nameUser[0]} ${userName}`;
        try {
            await api.changeNickname(newName, threadID, user.userID);
        } catch (e) {
            console.log(`Failed to change nickname: ${e}`);
        }
    }
}
