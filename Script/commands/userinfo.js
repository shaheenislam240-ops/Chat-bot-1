const fs = require("fs-extra");
const request = require("request");
const axios = require("axios");

module.exports.config = {
    name: "userinfo",
    version: "1.0.6",
    hasPermssion: 0,
    credits: "rX | Priyansh",
    description: "Get full info about a Facebook user",
    commandCategory: "Info",
    usages: "!userinfo @someone or ID",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, mentions, senderID } = event;

    // User ID বা mention
    let userID = Object.keys(mentions)[0] || args[0] || senderID;

    if (isNaN(userID)) {
        return api.sendMessage("❌ Please mention someone or type a valid numeric Facebook ID.", threadID, messageID);
    }

    // CKBOT style static access token
    const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

    try {
        // User info
        const url = `https://graph.facebook.com/${userID}?fields=id,name,first_name,last_name,about,birthday,gender,relationship_status,location,friends.limit(0).summary(true)&access_token=${token}`;
        const { data } = await axios.get(url);

        if (data.error) return api.sendMessage(`❌ Facebook API Error: ${data.error.message}`, threadID, messageID);

        let msg = `🧾 USER INFO\n\n`;
        msg += `📛 Full Name: ${data.name || "N/A"}\n`;
        msg += `🆔 ID: ${data.id || "N/A"}\n`;
        msg += `ℹ️ About: ${data.about || "N/A"}\n`;
        msg += `🎂 Birthday: ${data.birthday || "N/A"}\n`;
        msg += `🚻 Gender: ${data.gender || "N/A"}\n`;
        msg += `💞 Relationship: ${data.relationship_status || "N/A"}\n`;
        msg += `📍 Location: ${data.location?.name || "N/A"}\n`;
        msg += `👥 Friends: ${data.friends?.summary?.total_count || "N/A"}\n`;

        // CKBOT style cache
        const imgPath = __dirname + `/cache/${userID}.png`;
        if (!fs.existsSync(__dirname + `/cache`)) fs.mkdirSync(__dirname + `/cache`);

        // Profile picture download & send
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
        return api.sendMessage("❌ Failed to fetch user info. Check ID/mention or token.", threadID, messageID);
    }
};
