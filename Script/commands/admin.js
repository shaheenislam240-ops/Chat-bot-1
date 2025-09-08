const { writeFileSync, existsSync } = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "admin",
    version: "1.0.5",
    hasPermssion: 2,
    credits: "rX",
    description: "Admin Config",
    commandCategory: "Admin",
    usages: "Admin",
    cooldowns: 2,
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.languages = {
    "en": {
        "listAdmin": '𝐀𝐝𝐦𝗶𝗻 𝐋𝐢𝐬𝐭:\n%1\n\nSupport List:\n%2',
        "notHavePermssion": '[Admin] You have no permission to use "%1"',
        "addedNewAdmin": '[Admin] Added %1 Admin:\n%2',
        "addedNewNDH": '[Admin] Added %1 Support:\n%2',
        "removedAdmin": '[Admin] Removed %1 Admin:\n%2',
        "removedNDH": '[Admin] Removed %1 Support:\n%2'
    }
};

module.exports.onLoad = function () {
    const dataPath = path.resolve(__dirname, 'cache', 'data.json');
    if (!existsSync(dataPath)) {
        const obj = { adminbox: {} };
        writeFileSync(dataPath, JSON.stringify(obj, null, 4));
    } else {
        const data = require(dataPath);
        if (!data.hasOwnProperty('adminbox')) data.adminbox = {};
        writeFileSync(dataPath, JSON.stringify(data, null, 4));
    }
};

module.exports.run = async function ({ api, event, args, Users, permssion, getText }) {
    const { threadID, messageID, mentions } = event;
    const { configPath } = global.client;
    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);

    const ADMINBOT = global.config.ADMINBOT || config.ADMINBOT || [];
    const NDH = global.config.NDH || config.NDH || [];
    const content = args.slice(1);

    switch (args[0]) {
        case "list":
        case "all":
        case "-a": {
            let adminList = [];
            for (const id of ADMINBOT) {
                const name = (await Users.getData(id)).name;
                adminList.push(`🆔 ${id} - ${name}`);
            }
            let ndhList = [];
            for (const id of NDH) {
                const name = (await Users.getData(id)).name;
                ndhList.push(`🆔 ${id} - ${name}`);
            }
            return api.sendMessage(getText("listAdmin", adminList.join("\n"), ndhList.join("\n")), threadID, messageID);
        }

        case "add": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);
            let listAdd = [];
            if (mentions && Object.keys(mentions).length > 0) {
                for (const id of Object.keys(mentions)) {
                    ADMINBOT.push(id);
                    config.ADMINBOT.push(id);
                    listAdd.push(`${id} - ${event.mentions[id]}`);
                }
            } else if (content.length != 0 && !isNaN(content[0])) {
                ADMINBOT.push(content[0]);
                config.ADMINBOT.push(content[0]);
                const name = (await Users.getData(content[0])).name;
                listAdd.push(`${content[0]} - ${name}`);
            } else return global.utils.throwError(this.config.name, threadID, messageID);

            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            return api.sendMessage(getText("addedNewAdmin", listAdd.length, listAdd.join("\n")), threadID, messageID);
        }

        case "addndh": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "addndh"), threadID, messageID);
            let listAdd = [];
            if (mentions && Object.keys(mentions).length > 0) {
                for (const id of Object.keys(mentions)) {
                    NDH.push(id);
                    config.NDH.push(id);
                    listAdd.push(`${id} - ${event.mentions[id]}`);
                }
            } else if (content.length != 0 && !isNaN(content[0])) {
                NDH.push(content[0]);
                config.NDH.push(content[0]);
                const name = (await Users.getData(content[0])).name;
                listAdd.push(`${content[0]} - ${name}`);
            } else return global.utils.throwError(this.config.name, threadID, messageID);

            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            return api.sendMessage(getText("addedNewNDH", listAdd.length, listAdd.join("\n")), threadID, messageID);
        }

        case "remove":
        case "rm":
        case "delete": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "delete"), threadID, messageID);
            let listRemoved = [];
            if (mentions && Object.keys(mentions).length > 0) {
                for (const id of Object.keys(mentions)) {
                    const index = config.ADMINBOT.indexOf(id);
                    if (index !== -1) {
                        ADMINBOT.splice(index, 1);
                        config.ADMINBOT.splice(index, 1);
                        listRemoved.push(`${id} - ${event.mentions[id]}`);
                    }
                }
            } else if (content.length != 0 && !isNaN(content[0])) {
                const index = config.ADMINBOT.indexOf(content[0]);
                if (index !== -1) {
                    ADMINBOT.splice(index, 1);
                    config.ADMINBOT.splice(index, 1);
                    const name = (await Users.getData(content[0])).name;
                    listRemoved.push(`${content[0]} - ${name}`);
                }
            } else return global.utils.throwError(this.config.name, threadID, messageID);

            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            return api.sendMessage(getText("removedAdmin", listRemoved.length, listRemoved.join("\n")), threadID, messageID);
        }

        case "removendh": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "removendh"), threadID, messageID);
            let listRemoved = [];
            if (mentions && Object.keys(mentions).length > 0) {
                for (const id of Object.keys(mentions)) {
                    const index = config.NDH.indexOf(id);
                    if (index !== -1) {
                        NDH.splice(index, 1);
                        config.NDH.splice(index, 1);
                        listRemoved.push(`${id} - ${event.mentions[id]}`);
                    }
                }
            } else if (content.length != 0 && !isNaN(content[0])) {
                const index = config.NDH.indexOf(content[0]);
                if (index !== -1) {
                    NDH.splice(index, 1);
                    config.NDH.splice(index, 1);
                    const name = (await Users.getData(content[0])).name;
                    listRemoved.push(`${content[0]} - ${name}`);
                }
            } else return global.utils.throwError(this.config.name, threadID, messageID);

            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            return api.sendMessage(getText("removedNDH", listRemoved.length, listRemoved.join("\n")), threadID, messageID);
        }

        case "qtvonly": {
            const dataPath = path.resolve(__dirname, 'cache', 'data.json');
            const database = require(dataPath);
            const { adminbox } = database;
            if (permssion < 1) return api.sendMessage("You don't have permission.", threadID, messageID);
            adminbox[threadID] = !adminbox[threadID];
            writeFileSync(dataPath, JSON.stringify(database, null, 4));
            const msg = adminbox[threadID] ? "Enabled QTV only mode." : "Disabled QTV only mode.";
            return api.sendMessage(msg, threadID, messageID);
        }

        case "ndhonly": {
            if (permssion < 2) return api.sendMessage("You don't have permission.", threadID, messageID);
            config.ndhOnly = !config.ndhOnly;
            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            const msg = config.ndhOnly ? "Enabled NDH only mode." : "Disabled NDH only mode.";
            return api.sendMessage(msg, threadID, messageID);
        }

        case "ibonly": {
            if (permssion != 3) return api.sendMessage("You don't have permission.", threadID, messageID);
            config.adminPaOnly = !config.adminPaOnly;
            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            const msg = config.adminPaOnly ? "Enabled IB only mode." : "Disabled IB only mode.";
            return api.sendMessage(msg, threadID, messageID);
        }

        case "only": {
            if (permssion != 3) return api.sendMessage("You don't have permission.", threadID, messageID);
            config.adminOnly = !config.adminOnly;
            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            const msg = config.adminOnly ? "Enabled Admin only mode." : "Disabled Admin only mode.";
            return api.sendMessage(msg, threadID, messageID);
        }

        default:
            return global.utils.throwError(this.config.name, threadID, messageID);
    }
};
