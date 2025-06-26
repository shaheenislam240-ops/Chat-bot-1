module.exports.config = {
	name: "leave",
	eventType: ["log:unsubscribe"],
	version: "1.0.0",
	credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
	description: "Send simple message when someone leaves the group",
	dependencies: {}
};

module.exports.run = async function({ api, event }) {
	if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

	const { threadID } = event;
	const msg = "Nice knowing him.";

	return api.sendMessage(msg, threadID);
};
