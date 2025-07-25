const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
	name: "rule",
	version: "1.0.2",
	hasPermssion: 0,
	credits: "Modified by Maria for rX 💙",
	description: "Group rules: view without prefix, add/remove with prefix",
	commandCategory: "Box Chat",
	usages: "[add/remove/all] [content/ID]",
	cooldowns: 5,
	prefix: true // set true so add/remove use prefix
};

const pathData = path.join(__dirname, "cache", "rules.json");

module.exports.onLoad = () => {
	if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, "[]", "utf-8");
};

// ✅ handleEvent = only used to show rules with no prefix
module.exports.handleEvent = async ({ event, api }) => {
	const { body, threadID, messageID } = event;
	if (!body) return;

	const msg = body.trim().toLowerCase();
	if (msg !== "rule") return;

	// If user typed just "rule" — show the list (no prefix needed)
	let dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
	let thisThread = dataJson.find(item => item.threadID == threadID);
	if (!thisThread || thisThread.listRule.length === 0)
		return api.sendMessage("ℹ️ No rules have been added yet.", threadID, messageID);

	let output = "📋 Group Rules:\n\n";
	thisThread.listRule.forEach((rule, i) => {
		output += `${i + 1}. ${rule}\n`;
	});

	return api.sendMessage(output, threadID, messageID);
};

// ✅ run = used for add/remove/list — prefix required
module.exports.run = async ({ event, api, args }) => {
	const { threadID, messageID } = event;
	const content = args.slice(1).join(" ");
	const action = args[0];

	let dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
	let thisThread = dataJson.find(item => item.threadID == threadID);
	if (!thisThread) {
		thisThread = { threadID, listRule: [] };
		dataJson.push(thisThread);
	}

	switch (action) {
		case "add": {
			if (content.length === 0)
				return api.sendMessage("⚠️ Please provide rule text to add.", threadID, messageID);

			if (content.includes("\n")) {
				const lines = content.split("\n");
				lines.forEach(line => thisThread.listRule.push(line));
			} else {
				thisThread.listRule.push(content);
			}

			fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
			return api.sendMessage("✅ Rule added successfully!", threadID, messageID);
		}
		case "remove":
		case "rm":
		case "delete": {
			if (content === "all") {
				thisThread.listRule = [];
				fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
				return api.sendMessage("🗑️ All rules deleted.", threadID, messageID);
			}
			const index = parseInt(content) - 1;
			if (isNaN(index) || index < 0 || index >= thisThread.listRule.length)
				return api.sendMessage("⚠️ Invalid rule number.", threadID, messageID);

			thisThread.listRule.splice(index, 1);
			fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
			return api.sendMessage("✅ Rule deleted successfully.", threadID, messageID);
		}
		case "list":
		case "all": {
			if (thisThread.listRule.length === 0)
				return api.sendMessage("ℹ️ No rules have been added yet.", threadID, messageID);
			let msg = "📋 Group Rules:\n\n";
			thisThread.listRule.forEach((r, i) => msg += `${i + 1}. ${r}\n`);
			return api.sendMessage(msg, threadID, messageID);
		}
		default:
			return api.sendMessage("❓ Unknown action. Try: add, remove, list", threadID, messageID);
	}
};
