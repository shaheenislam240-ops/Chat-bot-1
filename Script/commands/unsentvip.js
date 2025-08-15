const fs = require("fs-extra");
const path = require("path");

module.exports = {
    name: "unsentvip",
    version: "1.0.5",
    description: "Add UID or mention to Unsent VIP list",
    usage: "!unsentvip <UID> or !unsentvip @mention",
    cooldown: 5,
    permission: ["100068565380737"], // allowed admin UIDs
    configFile: path.join(__dirname, "config.json"), // your config path

    run: async function({ api, event, args, Users, config }) {
        const { senderID, threadID, messageID, mentions } = event;

        // Check permission
        if (!this.permission.includes(senderID)) {
            return api.sendMessage("❌ You don't have permission to use this command.", threadID);
        }

        // Extract target UID(s)
        const mentionedUsers = Object.keys(mentions || {});
        const inputUID = args[0];

        if (!mentionedUsers.length && !inputUID) {
            return api.sendMessage("⚠️ Please mention a user or provide a UID.", threadID);
        }

        // Load current UNSENTVIP list
        if (!config.UNSENTVIP) config.UNSENTVIP = [];

        let addedUsers = [];

        // Add mentioned users
        for (const uid of mentionedUsers) {
            if (!config.UNSENTVIP.includes(uid)) {
                config.UNSENTVIP.push(uid);
                addedUsers.push(uid);
            }
        }

        // Add single UID if provided
        if (inputUID && !isNaN(inputUID) && !config.UNSENTVIP.includes(inputUID)) {
            config.UNSENTVIP.push(inputUID);
            addedUsers.push(inputUID);
        }

        if (!addedUsers.length) {
            return api.sendMessage("⚠️ No new users were added. They may already be in the VIP list.", threadID);
        }

        // Save to config file
        fs.writeFileSync(this.configFile, JSON.stringify(config, null, 4), "utf8");

        // Get names for reply
        let names = [];
        for (const uid of addedUsers) {
            const name = await Users.getNameUser(uid);
            names.push(name);
        }

        return api.sendMessage(`✅ Added to Unsent VIP: ${names.join(", ")}`, threadID);
    }
};
