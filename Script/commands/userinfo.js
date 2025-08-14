const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
    name: "userinfo",
    version: "1.0.8",
    hasPermssion: 0,
    credits: "rX | Priyansh",
    description: "Get basic Facebook user info",
    commandCategory: "Info",
    usages: "!userinfo @someone or ID",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, mentions, senderID } = event;
    const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

    // User ID: mention > args[0] > senderID
    let uid = Object.keys(mentions)[0] || args[0] || senderID;

    if (!uid) return api.sendMessage("❌ Please mention someone or type their numeric Facebook ID.", threadID, messageID);

    try {
        const userData = await api.getUserInfo(uid);
        const data = userData[uid];

        // Basic info
        const name = data.name || "N/A";
        const url = data.profileUrl || "N/A";
        const gender = data.gender == 2 ? "Male" : data.gender == 1 ? "Female" : "N/A";

        const msg = `🧾 User Info\n\nName: ${name}\nProfile URL: ${url}\nGender: ${gender}\nUID: ${uid}`;

        // Profile pic download path (ckbot style)
        const imgPath = __dirname + `/cache/${uid}.png`;
        if (!fs.existsSync(__dirname + `/cache`)) fs.mkdirSync(__dirname + `/cache`);

        const picUrl = `https://graph.facebook.com/${uid}/picture?height=720&width=720&access_token=${token}`;

        request(encodeURI(picUrl))
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
        console.error(err);
        return api.sendMessage("❌ Failed to fetch user info. Check ID/mention or token.", threadID, messageID);
    }
};
