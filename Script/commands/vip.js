const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "vip",
    version: "1.0.0",
    hasPermssion: 3, // ADMINBOT only
    credits: "Rx Abdullah",
    description: "Manage VIP mode & VIP users",
    commandCategory: "Admin",
    usages: "[on|off|add|remove|list] <userID>",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const vipFilePath = path.join(__dirname, "../../Script/commands/cache/vip.json");
    const vipModePath = path.join(__dirname, "../../Script/commands/cache/vipMode.json");

    // ===== Helpers =====
    const loadVIP = () => {
        if (!fs.existsSync(vipFilePath)) return [];
        return JSON.parse(fs.readFileSync(vipFilePath, "utf-8"));
    }

    const saveVIP = (list) => fs.writeFileSync(vipFilePath, JSON.stringify(list, null, 2), "utf-8");

    const loadVIPMode = () => {
        if (!fs.existsSync(vipModePath)) return false;
        const data = JSON.parse(fs.readFileSync(vipModePath, "utf-8"));
        return data.vipMode || false;
    }

    const saveVIPMode = (mode) => fs.writeFileSync(vipModePath, JSON.stringify({ vipMode: mode }, null, 2), "utf-8");
    // ===== End helpers =====

    const subCommand = args[0]?.toLowerCase();
    const targetID = args[1];

    if (!subCommand) return api.sendMessage("Usage: vip [on|off|add|remove|list] <userID>", event.threadID);

    let vipList = loadVIP();
    let vipMode = loadVIPMode();

    switch(subCommand) {
        case "on":
            saveVIPMode(true);
            return api.sendMessage("✅ VIP mode is now ON. Only VIP users can use commands.", event.threadID);

        case "off":
            saveVIPMode(false);
            return api.sendMessage("✅ VIP mode is now OFF. Everyone can use commands.", event.threadID);

        case "add":
            if (!targetID) return api.sendMessage("❌ Please provide a userID to add.", event.threadID);
            if (vipList.includes(targetID)) return api.sendMessage("❌ User is already VIP.", event.threadID);
            vipList.push(targetID);
            saveVIP(vipList);
            return api.sendMessage(`✅ Added ${targetID} to VIP list.`, event.threadID);

        case "remove":
            if (!targetID) return api.sendMessage("❌ Please provide a userID to remove.", event.threadID);
            if (!vipList.includes(targetID)) return api.sendMessage("❌ User is not in VIP list.", event.threadID);
            vipList = vipList.filter(id => id !== targetID);
            saveVIP(vipList);
            return api.sendMessage(`✅ Removed ${targetID} from VIP list.`, event.threadID);

        case "list":
            if (vipList.length === 0) return api.sendMessage("VIP list is empty.", event.threadID);
            return api.sendMessage(`📋 VIP Users:\n${vipList.join("\n")}`, event.threadID);

        default:
            return api.sendMessage("Unknown subcommand. Usage: vip [on|off|add|remove|list] <userID>", event.threadID);
    }
};
