const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "userinfo",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "rX",
    description: "Get full info about a Facebook user",
    commandCategory: "Info",
    usages: "!userinfo @someone",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, mentions } = event;

    // Mention kora user ba ID/Name
    let userID = Object.keys(mentions)[0] || args[0];
    if(!userID) return api.sendMessage("❌ Please mention someone or type their Facebook ID.", threadID, messageID);

    // Facebook Graph API token already set
    const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

    const url = `https://graph.facebook.com/${userID}?fields=id,name,first_name,last_name,about,birthday,gender,relationship_status,location,friends&access_token=${token}`;

    try {
        const { data } = await axios.get(url);

        let msg = `🧾 User Info:\n\n`;
        msg += `Full Name: ${data.name || "N/A"}\n`;
        msg += `ID: ${data.id || "N/A"}\n`;
        msg += `About: ${data.about || "N/A"}\n`;
        msg += `Birthday: ${data.birthday || "N/A"}\n`;
        msg += `Gender: ${data.gender || "N/A"}\n`;
        msg += `Relationship: ${data.relationship_status || "N/A"}\n`;
        msg += `Location: ${data.location?.name || "N/A"}\n`;
        msg += `Friends: ${data.friends?.summary?.total_count || "N/A"}\n`;

        // Profile picture
        const picURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=${token}`;
        const picPath = path.join(__dirname, `${userID}.jpg`);
        const pic = (await axios.get(picURL, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(picPath, Buffer.from(pic, "utf-8"));

        api.sendMessage({ body: msg, attachment: fs.createReadStream(picPath) }, threadID, () => fs.unlinkSync(picPath), messageID);
    } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Failed to fetch user info. Check the ID/mention or your access token.", threadID, messageID);
    }
};
