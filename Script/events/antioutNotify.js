module.exports.config = {
	name: "antioutNotify",
	eventType: ["log:unsubscribe"],
	version: "1.0.4",
	credits: "rX",
	description: "Notify when someone leaves or is kicked (username bold front)"
};

// Convert text to bold Unicode (𝐀𝐁𝐂 style)
function toBold(text) {
	const boldA = 0x1d400; 
	return text
		.split("")
		.map(c => {
			if (c >= "A" && c <= "Z") return String.fromCodePoint(boldA + c.charCodeAt(0) - 65);
			if (c >= "a" && c <= "z") return String.fromCodePoint(boldA + 26 + c.charCodeAt(0) - 97);
			return c;
		})
		.join("");
}

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

		// Convert username to bold
		const boldName = toBold(userName);

		// Detect type (antiout logic)
		const type = (author == userID) ? "self" : "kicked";

		// Prepare message with bold username front
		let msg = "";
		if (type === "self") {
			msg = `${boldName} left the group`;
		} else {
			let kickerName = global.data.userName.get(author) || author;
			try {
				const kickerInfo = await api.getUserInfo(author);
				kickerName = kickerInfo[author].name || kickerName;
			} catch (e) {
				console.error(e);
			}
			const boldKicker = toBold(kickerName);
			msg = `${boldName} was kicked`;
		}

		// Send message
		api.sendMessage(msg, threadID);

	} catch (err) {
		console.error(err);
	}
};
