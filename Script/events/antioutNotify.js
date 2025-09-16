module.exports.config = {
	name: "antioutNotify",
	eventType: ["log:unsubscribe"],
	version: "1.0.3",
	credits: "rX",
	description: "Notify when someone leaves or is kicked (username front only)"
};

module.exports.run = async ({ event, api, Users }) => {
	try {
		const userID = event.logMessageData.leftParticipantFbId;
		const { author, threadID } = event;

		// Ignore bot itself
		if (userID == api.getCurrentUserID()) return;

		// Fetch user name
		let userName = global.data.userName.get(userID) || "Someone";
		try {
			const userInfo = await api.getUserInfo(userID);
			userName = userInfo[userID].name || userName;
		} catch (e) {
			console.error(e);
		}

		// Detect type (antiout logic)
		const type = (author == userID) ? "self" : "kicked";

		// Prepare message with username front
		let msg = "";
		if (type === "self") {
			msg = `${userName} left the group voluntarily.`;
		} else {
			let kickerName = global.data.userName.get(author) || author;
			try {
				const kickerInfo = await api.getUserInfo(author);
				kickerName = kickerInfo[author].name || kickerName;
			} catch (e) {
				console.error(e);
			}
			msg = `${userName} was kicked by ${kickerName}.`;
		}

		// Send message
		api.sendMessage(msg, threadID);

	} catch (err) {
		console.error(err);
	}
};
