module.exports.config = {
	name: "adminUpdate",
	eventType: ["log:thread-admins","log:thread-name", "log:user-nickname","log:thread-icon","log:thread-call","log:thread-color"],
	version: "1.0.1",
	credits: "𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁",
	description: "Update team information quickly",
    envConfig: {
        sendNoti: true,
    }
};

module.exports.run = async function ({ event, api, Threads, Users }) {
	const fs = require("fs");
	var iconPath = __dirname + "/emoji.json";
	if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));
    const { threadID, logMessageType, logMessageData } = event;
    const { setData, getData } = Threads;

    const thread = global.data.threadData.get(threadID) || {};
    if (typeof thread["adminUpdate"] != "undefined" && thread["adminUpdate"] == false) return;

    try {
        let dataThread = (await getData(threadID)).threadInfo;
        switch (logMessageType) {
            case "log:thread-admins": {
                if (logMessageData.ADMIN_EVENT == "add_admin") {
                    dataThread.adminIDs.push({ id: logMessageData.TARGET_ID });
                    if (global.configModule[this.config.name].sendNoti) {
                        api.sendMessage(`»» NOTICE «« Update user ${logMessageData.TARGET_ID} এই নে বলদ তোরে গ্রুপে এড়মিন দিলাম 😁🫵🏾`, threadID);
                    }
                } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
                    dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
                    if (global.configModule[this.config.name].sendNoti) {
                        api.sendMessage(`»» NOTICE «« Update user ${logMessageData.TARGET_ID} তুই পাগল ছাগল এড়মিন হওয়ার যোগ্য না \n তাই তোকে এড়মিন থেকে লাথি মেরে নামিয়ে দেওয়া হলো|`, threadID);
                    }
                }
                break;
            }
            case "log:user-nickname":
            case "log:thread-call":
            case "log:thread-color":
            case "log:thread-icon":
            case "log:thread-name": {
                break;
            }
        }
        await setData(threadID, { threadInfo: dataThread });
    } catch (e) {
        console.log(e);
    }
}
