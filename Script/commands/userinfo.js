const fs = require("fs-extra");
const request = require("request");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "userinfo",
    version: "1.0.4",
    hasPermssion: 0,
    credits: "rX | Modified by Priyansh",
    description: "Get full info about a Facebook user",
    commandCategory: "Info",
    usages: "!userinfo @someone or ID",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, mentions, senderID } = event;

    // Mention করা হলে mention এর ID, না হলে args[0], সেটাও না হলে নিজের ID
    let userID = Object.keys(mentions)[0] || args[0] || senderID;

    if (isNaN(userID)) {
        return api.sendMessage("❌ Please mention someone or type a valid Facebook numeric ID.", threadID, messageID);
    }

    // Facebook Graph API token
    const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

    try {
        // User info fetch
        const url = `https://graph.facebook.com/${userID}?fields=id,name,first_name,last_name,about,birthday,gender,relationship_status,location,friends.limit(0).summary(true)&access_token=${token}`;
        const { data } = await axios.get(url);

        if (data.error) {
            return api.sendMessage(`❌ Facebook API Error: ${data.error.message}`, threadID, messageID);
        }

        let msg = `🧾 USER INFO\n\n`;
        msg += `📛 Full Name: ${data.name || "N/A"}\n`;
        msg += `🆔 ID: ${data.id || "N/A"}\n`;
        msg += `ℹ️ About: ${data.about || "N/A"}\n`;
        msg += `🎂 Birthday: ${data.birthday || "N/A"}\n`;
        msg += `🚻 Gender: ${data.gender || "N/A"}\n`;
        msg += `💞 Relationship: ${data.relationship_status || "N/A"}\n`;
        msg += `📍 Location: ${data.location?.name || "N/A"}\n`;
        msg += `👥 Friends: ${data.friends?.summary?.total_count || "N/A"}\n`;

        // Picture save path (UID.png)
        const imgPath = path.join(__dirname, "cache", `${userID}.png`);

        // যদি cache ফোল্ডার না থাকে, আগে তৈরি করো
        if (!fs.existsSync(path.join(__dirname, "cache"))) {
            fs.mkdirSync(path.join(__dirname, "cache"));
        }

        // Download profile picture (ckbot style)
        request(encodeURI(`https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=${token}`))
            .pipe(fs.createWriteStream(imgPath))
            .on("close", () => {
                api.sendMessage(
                    { body: msg, attachment: fs.createReadStream(imgPath) },
                    threadID,
                    () => fs.unlinkSync(imgPath),
                    messageID
                );
            });

    } catch (err) {
        console.error("Userinfo Error:", err.message);
        return api.sendMessage("❌ Failed to fetch user info. Possible reasons:\n• Invalid ID or privacy settings\n• Token expired or blocked", threadID, messageID);
    }
};
