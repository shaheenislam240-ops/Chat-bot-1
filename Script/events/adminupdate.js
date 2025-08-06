module.exports.config = {
	name: "adminUpdate",
	eventType: ["log:thread-admins","log:thread-name", "log:user-nickname","log:thread-icon","log:thread-call","log:thread-color"],
	version: "1.0.1",
	credits: "rX",
	description: "Update team information quickly",
    envConfig: {
        sendNoti: true,
    }
};

module.exports.run = async function ({ event, api, Threads, Users }) {
	const fs = require("fs");
	const moment = require("moment-timezone");
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
                const timeNow = moment.tz("Asia/Dhaka").format("dddd, h:mm A");

                if (logMessageData.ADMIN_EVENT == "add_admin") {
                    dataThread.adminIDs.push({ id: logMessageData.TARGET_ID });
                    if (global.configModule[this.config.name].sendNoti) {
                        let addedBy = await Users.getNameUser(event.author);
                        let newAdmin = await Users.getNameUser(logMessageData.TARGET_ID);

                        const msg = `**[ 👑 ADMIN ADDED ]**
・By         : ${addedBy}
・Made Admin : ${newAdmin}
・Time       : ${timeNow}`;

                        api.sendMessage(msg, threadID);
                    }
                } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
                    dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
                    if (global.configModule[this.config.name].sendNoti) {
                        let removedBy = await Users.getNameUser(event.author);
                        let removedAdmin = await Users.getNameUser(logMessageData.TARGET_ID);

                        const msg = `**[ 👑 ADMIN REMOVED ]**
・By         : ${removedBy}
・Removed    : ${removedAdmin}
・Time       : ${timeNow}`;

                        api.sendMessage(msg, threadID);
                    }
                }
                break;
            }

            case "log:user-nickname":
            case "log:thread-call":
            case "log:thread-color":
            case "log:thread-icon":
            case "log:thread-name": {
                // ei khane future custom notifications add korte paro
                break;
            }
        }

        await setData(threadID, { threadInfo: dataThread });
    } catch (e) {
        console.log(e);
    }
}
