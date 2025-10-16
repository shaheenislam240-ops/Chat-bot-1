module.exports.config = {
	name: "user",
	version: "1.0.6",
	hasPermssion: 2,
	credits: "rX",
	description: "Ban or unblock users (supports reply)",
	commandCategory: "system",
	usages: "[unban/ban/search/list/info] [ID or reply message]",
	cooldowns: 5
};

const moment = require("moment-timezone");

module.exports.run = async ({ event, api, args, Users, getText }) => {
	const { threadID, messageID, messageReply } = event;
	let type = args[0];
	let targetID = args[1];
	let reason = args.slice(2).join(" ") || null;

	// ✅ Reply message system add
	if (event.type === "message_reply" && messageReply) {
		targetID = messageReply.senderID; // reply করা ইউজারের ID
	}

	// ✅ Mention system
	if (isNaN(targetID)) {
		const mention = Object.keys(event.mentions);
		if (mention.length > 0) {
			targetID = mention[0];
			reason = args.slice(args.indexOf(event.mentions[mention[0]]) + 1).join(" ") || null;
		}
	}

	if (!targetID) return api.sendMessage("⚠️ Please reply to a user or provide a user ID.", threadID, messageID);

	switch (type) {
		case "ban":
		case "-b": {
			if (!global.data.allUserID.includes(targetID))
				return api.sendMessage(getText("IDNotFound", "[ Ban User ]"), threadID, messageID);

			if (global.data.userBanned.has(targetID)) {
				const { reason, dateAdded } = global.data.userBanned.get(targetID) || {};
				return api.sendMessage(
					getText("existBan", targetID, (reason ? `${getText("reason")}: "${reason}"` : ""), (dateAdded ? `${getText("at")} ${dateAdded}` : "")),
					threadID,
					messageID
				);
			}

			const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
			return api.sendMessage(
				getText("returnBan", `${targetID} - ${nameTarget}`, (reason ? `\n- ${getText("reason")}: ${reason}` : "")),
				threadID,
				(error, info) => {
					global.client.handleReaction.push({
						type: "ban",
						targetID,
						reason,
						nameTarget,
						name: this.config.name,
						messageID: info.messageID,
						author: event.senderID
					});
				},
				messageID
			);
		}

		case "unban":
		case "-ub": {
			if (!global.data.allUserID.includes(targetID))
				return api.sendMessage(getText("IDNotFound", "[ Unban User ]"), threadID, messageID);

			if (!global.data.userBanned.has(targetID))
				return api.sendMessage(getText("notExistBan"), threadID, messageID);

			const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
			return api.sendMessage(
				getText("returnUnban", `${targetID} - ${nameTarget}`),
				threadID,
				(error, info) => {
					global.client.handleReaction.push({
						type: "unban",
						targetID,
						nameTarget,
						name: this.config.name,
						messageID: info.messageID,
						author: event.senderID
					});
				},
				messageID
			);
		}

		case "search":
		case "-s": {
			const contentJoin = reason || "";
			const getUsers = (await Users.getAll(["userID", "name"])).filter(item => !!item.name);
			let matchUsers = getUsers.filter(i => i.name.toLowerCase().includes(contentJoin.toLowerCase()));
			let result = matchUsers.map((i, idx) => `${idx + 1}. ${i.name} - ${i.userID}`).join("\n");
			return api.sendMessage(matchUsers.length > 0 ? getText("returnResult", result) : getText("returnNull"), threadID);
		}

		case "list":
		case "-l": {
			let listBan = [];
			let i = 0;
			for (const [idUser] of global.data.userBanned) {
				const userName = global.data.userName.get(idUser) || (await Users.getNameUser(idUser)) || "unknown";
				listBan.push(`${++i}. ${idUser} - ${userName}`);
				if (i === (parseInt(reason) || 10)) break;
			}
			return api.sendMessage(
				getText("returnList", global.data.userBanned.size || 0, listBan.length, listBan.join("\n")),
				threadID,
				messageID
			);
		}

		case "info":
		case "-i": {
			if (!global.data.allUserID.includes(targetID))
				return api.sendMessage(getText("IDNotFound", "[ Info User ]"), threadID, messageID);

			let commandBanned = global.data.commandBanned.get(targetID) || [];
			let userBanInfo = global.data.userBanned.get(targetID) || {};
			const { reason: banReason, dateAdded } = userBanInfo;
			const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);

			return api.sendMessage(
				getText("returnInfo",
					`${targetID} - ${nameTarget}`,
					userBanInfo ? "✅ YES" : "❌ NO",
					banReason ? `${getText("reason")}: "${banReason}"` : "",
					dateAdded ? `${getText("at")}: ${dateAdded}` : "",
					commandBanned.length > 0 ? `✅ ${commandBanned.join(", ")}` : "❌ NONE"
				),
				threadID,
				messageID
			);
		}

		default:
			return api.sendMessage("⚙️ Usage: user [ban/unban/search/list/info] [ID or reply user]", threadID, messageID);
	}
};
