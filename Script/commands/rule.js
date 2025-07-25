const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
	name: "rule",
	version: "1.0.3",
	hasPermssion: 0,
	credits: "Maria for rX 💙",
	description: "Group rules: view, add, remove — all without prefix",
	commandCategory: "Box Chat",
	usages: "[add/remove/all] [content/ID]",
	cooldowns: 3,
	prefix: false // ✅ no prefix needed at all
};

const pathData = path.join(__dirname, "cache", "rules.json");

module.exports.onLoad = () => {
	if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, "[]", "utf-8");
};

module.exports.handleEvent = async ({ event, api }) => {
	const { body, threadID, messageID } = event;
	if (!body) return;

	const args = body.trim().split(/\s+/);
	const command = args.shift()?.toLowerCase();

	if (command !== "rule") return;

	let action = args[0]?.toLowerCase() || "";
	let content = args.slice(1).join(" ");
	let dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
	let thisThread = dataJson.find(item => item.threadID == threadID);

	if (!thisThread) {
		thisThread = { threadID, listRule: [] };
		dataJson.push(thisThread);
	}

	// === Handle commands ===
	switch (action) {
		case "add": {
			if (!content.length)
				return api.sendMessage("⚠️ Please provide the rule content to add.", threadID, messageID);
			if (content.includes("\n")) {
				const lines = content.split("\n");
				lines.forEach(line => thisThread.listRule.push(line));
			} else {
				thisThread.listRule.push(content);
			}
			fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
			return api.sendMessage("✅ Rule has been added successfully.", threadID, messageID);
		}
		case "remove":
		case "rm":
		case "delete": {
			if (content === "all") {
				thisThread.listRule = [];
				fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
				return api.sendMessage("🗑️ All rules have been deleted.", threadID, messageID);
			}
			const index = parseInt(content) - 1;
			if (isNaN(index) || index < 0 || index >= thisThread.listRule.length)
				return api.sendMessage("⚠️ Invalid rule number.", threadID, messageID);
			thisThread.listRule.splice(index, 1);
			fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
			return api.sendMessage("✅ Rule deleted successfully.", threadID, messageID);
		}
		case "list":
		case "all":
		case "show":
		case undefined: {
			if (thisThread.listRule.length === 0)
				return api.sendMessage("ℹ️ No rules have been set yet in this group.", threadID, messageID);
			let msg = "📋 Group Rules:\n\n";
			thisThread.listRule.forEach((rule, i) => {
				msg += `${i + 1}. ${rule}\n`;
			});
			return api.sendMessage(msg, threadID, messageID);
		}
		default:
			return api.sendMessage("❓ Unknown action. Try:\n- rule\n- rule add [text]\n- rule remove [no]/all", threadID, messageID);
	}
};

module.exports.run = () => {}; // empty, because handleEvent handles all
