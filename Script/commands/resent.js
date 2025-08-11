module.exports.config = {
    name: "resend",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "rX",
    description: "Là resend thôi Fix Ver > 1.2.13",
    commandCategory: "general",
    usages: "",
    cooldowns: 0,
    hide: true,
    dependencies: {
        "request": "",
        "fs-extra": "",
        "axios": ""
    }
};

module.exports.handleEvent = async function ({ event, api, Users }) {
    const request = global.nodemodule["request"];
    const axios = global.nodemodule["axios"];
    const { writeFileSync, createReadStream } = global.nodemodule["fs-extra"];

    const { messageID, senderID, threadID, body, type, attachments } = event;

    if (!global.logMessage) global.logMessage = new Map();
    if (!global.data.botID) global.data.botID = api.getCurrentUserID();

    const threadSetting = global.data.threadData.get(threadID) || {};

    // ✅ ডিফল্টে OFF, শুধু চালু থাকলেই কাজ করবে
    if (threadSetting.resend !== true) return;

    if (senderID != global.data.botID) {
        if (type !== "message_unsend") {
            global.logMessage.set(messageID, {
                msgBody: body,
                attachment: attachments
            });
        } else {
            const msgData = global.logMessage.get(messageID);
            if (!msgData) return;

            const name = await Users.getNameUser(senderID);

            if (!msgData.attachment || !msgData.attachment[0]) {
                return api.sendMessage(`${name} removed 1 message\nContent: ${msgData.msgBody || "(no text)"}`, threadID);
            }

            let count = 0;
            let sendData = {
                body: `${name} just removed ${msgData.attachment.length} attachment.${msgData.msgBody ? `\n\nContent: ${msgData.msgBody}` : ""}`,
                attachment: [],
                mentions: [{ tag: name, id: senderID }]
            };

            for (let file of msgData.attachment) {
                count++;
                let fileExt = (await request.get(file.url)).uri.pathname.split(".").pop();
                let filePath = __dirname + `/cache/${count}.${fileExt}`;
                let fileData = (await axios.get(file.url, { responseType: "arraybuffer" })).data;
                writeFileSync(filePath, Buffer.from(fileData, "utf-8"));
                sendData.attachment.push(createReadStream(filePath));
            }
            api.sendMessage(sendData, threadID);
        }
    }
};

module.exports.languages = {
    vi: {
        on: "Bật",
        off: "Tắt",
        successText: "resend thành công"
    },
    en: {
        on: "『ON』",
        off: "『OFF』",
        successText: "resend success!"
    }
};

module.exports.run = async function ({ api, event, Threads, getText }) {
    const { threadID, messageID } = event;
    let data = (await Threads.getData(threadID)).data;

    // ✅ ডিফল্টে OFF
    if (typeof data.resend === "undefined") data.resend = false;

    data.resend = !data.resend;

    await Threads.setData(threadID, { data });
    global.data.threadData.set(threadID, data);

    api.sendMessage(`${data.resend ? getText("on") : getText("off")} ${getText("successText")}`, threadID, messageID);
};
