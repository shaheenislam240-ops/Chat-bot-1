const fs = require("fs-extra");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
	name: "antioutNotify",
	eventType: ["log:unsubscribe"],
	version: "2.0.0",
	credits: "rX Abdullah",
	description: "Send custom goodbye image when someone leaves or is kicked"
};

module.exports.run = async ({ event, api }) => {
	const userID = event.logMessageData.leftParticipantFbId;
	const author = event.author;
	const threadID = event.threadID;

	if (userID == api.getCurrentUserID()) return; // Ignore bot

	try {
		// === 1️⃣ Get user info ===
		const resUser = await api.getUserInfo(userID);
		const userName = resUser[userID]?.name || "Unknown User";

		// === 2️⃣ Download profile picture from Graph API ===
		const profilePicURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
		const profileBuffer = (await axios.get(profilePicURL, { responseType: "arraybuffer" })).data;

		// === 3️⃣ Download frame ===
		const frameURL = "https://i.postimg.cc/BQ5bdybC/retouch-2025100422414510.jpg";
		const frameBuffer = (await axios.get(frameURL, { responseType: "arraybuffer" })).data;

		// === 4️⃣ Create canvas ===
		const base = await Canvas.loadImage(frameBuffer);
		const avatar = await Canvas.loadImage(profileBuffer);
		const canvas = Canvas.createCanvas(base.width, base.height);
		const ctx = canvas.getContext("2d");

		// Draw frame background
		ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

		// === 5️⃣ Draw circular profile image ===
		const pX = 90, pY = 110, pSize = 150; // adjust to fit circle
		ctx.save();
		ctx.beginPath();
		ctx.arc(pX + pSize / 2, pY + pSize / 2, pSize / 2, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(avatar, pX, pY, pSize, pSize);
		ctx.restore();

		// === 6️⃣ Add name text ===
		ctx.font = "bold 32px Sans";
		ctx.fillStyle = "#00A8FF"; // light blue (matches Goodbye text)
		ctx.textAlign = "left";
		ctx.fillText(userName, 270, 160); // right of profile picture

		// === 7️⃣ Save and send ===
		const imgPath = __dirname + `/cache/goodbye_${userID}.png`;
		fs.writeFileSync(imgPath, canvas.toBuffer());

		api.sendMessage({
			body: `Goodbye, ${userName}! 👋`,
			attachment: fs.createReadStream(imgPath)
		}, threadID, () => fs.unlinkSync(imgPath));

	} catch (e) {
		console.error(e);
		api.sendMessage("❌ Error creating goodbye frame.", event.threadID);
	}
};
